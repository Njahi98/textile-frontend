import { useEffect, useState, useCallback } from 'react';
import { InsightsFilters, insightsAPI, AIInsightResponse } from '@/services/insights.api';
import { toast } from 'sonner';

const STORAGE_KEYS = {
  INSIGHTS_DATA: 'ai_insights_data',
  RATE_LIMIT_STATE: 'ai_insights_rate_limit',
  FILTERS_STATE: 'ai_insights_filters'
};

interface PersistedInsightData {
  insights: AIInsightResponse['insights'];
  dataAnalyzed: AIInsightResponse['dataAnalyzed'];
  timestamp: number;
  filters: InsightsFilters;
}

interface PersistedRateLimitState {
  isRateLimited: boolean;
  remainingTime: number;
  resetTime?: number;
  timestamp: number;
}

function saveToStorage(key: string, data: any) {
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
}
function loadFromStorage(key: string) {
  try { const item = sessionStorage.getItem(key); return item ? JSON.parse(item) : null; } catch { return null; }
}
function clearStorage(key: string) {
  try { sessionStorage.removeItem(key); } catch {}
}

export default function useAiInsights(t: (key: string, options?: any) => string) {
  const [filters, setFilters] = useState<InsightsFilters>(() => loadFromStorage(STORAGE_KEYS.FILTERS_STATE) || {});
  const [persistedData, setPersistedData] = useState<PersistedInsightData | null>(() => loadFromStorage(STORAGE_KEYS.INSIGHTS_DATA));
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isRateLimited: boolean; remainingTime: number; resetTime?: number }>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.RATE_LIMIT_STATE) as PersistedRateLimitState | null;
    if (stored) {
      const elapsed = Math.floor((Date.now() - stored.timestamp) / 1000);
      const remainingTime = Math.max(0, stored.remainingTime - elapsed);
      if (remainingTime <= 0) { clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE); return { isRateLimited: false, remainingTime: 0 }; }
      return { isRateLimited: stored.isRateLimited, remainingTime, resetTime: stored.resetTime };
    }
    return { isRateLimited: false, remainingTime: 0 };
  });
  const [cooldownTimer, setCooldownTimer] = useState<number>(rateLimitInfo.remainingTime);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasValidFilters = Boolean(filters.startDate && filters.endDate);

  useEffect(() => { saveToStorage(STORAGE_KEYS.FILTERS_STATE, filters); }, [filters]);
  useEffect(() => {
    if (rateLimitInfo.isRateLimited || rateLimitInfo.remainingTime > 0) {
      const stateToSave: PersistedRateLimitState = { ...rateLimitInfo, timestamp: Date.now() } as any;
      saveToStorage(STORAGE_KEYS.RATE_LIMIT_STATE, stateToSave);
    } else {
      clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
    }
  }, [rateLimitInfo]);

  useEffect(() => { setCooldownTimer(rateLimitInfo.remainingTime); }, [rateLimitInfo.remainingTime]);

  useEffect(() => {
    let interval: any;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            setRateLimitInfo({ isRateLimited: false, remainingTime: 0 });
            clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
            clearStorage(STORAGE_KEYS.INSIGHTS_DATA);
            setPersistedData(null);
            toast.success(t('canGenerateNewReport'), { duration: 3000 });
            return 0;
          }
          setRateLimitInfo(prevInfo => ({ ...prevInfo, remainingTime: newValue }));
          return newValue;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [cooldownTimer, t]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate: startDate || undefined, endDate: endDate || undefined }));
  };

  const handleRefresh = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error(t('selectDateRangeError'), { duration: 3000 });
      return;
    }
    if (rateLimitInfo.isRateLimited) {
      toast.error(t('rateLimitMessage', { time: `${rateLimitInfo.remainingTime}s` }), { duration: 8000 });
      return;
    }
    const currentData = persistedData;
    try {
      setIsGenerating(true);
      clearStorage(STORAGE_KEYS.INSIGHTS_DATA);
      setPersistedData(null);
      const result = await insightsAPI.getAIInsights(filters);
      const dataToSave: PersistedInsightData = { insights: result.insights, dataAnalyzed: result.dataAnalyzed, timestamp: Date.now(), filters: { ...filters } };
      setPersistedData(dataToSave);
      saveToStorage(STORAGE_KEYS.INSIGHTS_DATA, dataToSave);
      toast.success(result.message, { duration: 3000 });
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const errorData = err.response.data;
        if (currentData) { setPersistedData(currentData); saveToStorage(STORAGE_KEYS.INSIGHTS_DATA, currentData); }
        if (errorData?.remainingTime) {
          setRateLimitInfo({ isRateLimited: true, remainingTime: errorData.remainingTime, resetTime: errorData.resetTime });
          setCooldownTimer(errorData.remainingTime);
          toast.error(t('rateLimitMessage', { time: `${errorData.remainingTime}s` }), { duration: 8000 });
        } else {
          toast.error(errorData.message, { duration: 5000 });
        }
      } else {
        toast.error(t('errorGeneratingInsights'), { duration: 3000 });
      }
    } finally { setIsGenerating(false); }
  }, [filters, persistedData, rateLimitInfo.isRateLimited, t]);

  return {
    filters,
    setFilters,
    persistedData,
    setPersistedData,
    rateLimitInfo,
    cooldownTimer,
    isGenerating,
    hasValidFilters,
    handleDateRangeChange,
    handleRefresh,
  };
}
