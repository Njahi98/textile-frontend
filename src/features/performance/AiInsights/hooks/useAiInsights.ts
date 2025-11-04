import { useEffect, useState, useCallback } from 'react';
import { InsightsFilters, insightsAPI, AIInsightResponse } from '@/services/insights.api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const STORAGE_KEYS = {
  INSIGHTS_DATA: 'ai_insights_data',
  RATE_LIMIT_STATE: 'ai_insights_rate_limit',
  FILTERS_STATE: 'ai_insights_filters'
} as const;

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

interface RateLimitErrorResponse {
  remainingTime?: number;
  resetTime?: number;
  message?: string;
}

function saveToStorage(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

function clearStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

export default function useAiInsights(t: (key: string, options?: Record<string, unknown>) => string) {
  const [filters, setFilters] = useState<InsightsFilters>(() => 
    loadFromStorage<InsightsFilters>(STORAGE_KEYS.FILTERS_STATE) ?? {}
  );
  
  const [persistedData, setPersistedData] = useState<PersistedInsightData | null>(() => 
    loadFromStorage<PersistedInsightData>(STORAGE_KEYS.INSIGHTS_DATA)
  );
  
  const [rateLimitInfo, setRateLimitInfo] = useState<{ 
    isRateLimited: boolean; 
    remainingTime: number; 
    resetTime?: number 
  }>(() => {
    const stored = loadFromStorage<PersistedRateLimitState>(STORAGE_KEYS.RATE_LIMIT_STATE);
    if (stored) {
      const elapsed = Math.floor((Date.now() - stored.timestamp) / 1000);
      const remainingTime = Math.max(0, stored.remainingTime - elapsed);
      if (remainingTime <= 0) {
        clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
        return { isRateLimited: false, remainingTime: 0 };
      }
      return { 
        isRateLimited: stored.isRateLimited, 
        remainingTime, 
        resetTime: stored.resetTime 
      };
    }
    return { isRateLimited: false, remainingTime: 0 };
  });
  
  const [cooldownTimer, setCooldownTimer] = useState<number>(rateLimitInfo.remainingTime);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasValidFilters = Boolean(filters.startDate && filters.endDate);

  // Save filters to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FILTERS_STATE, filters);
  }, [filters]);

  // Save rate limit state to storage
  useEffect(() => {
    if (rateLimitInfo.isRateLimited || rateLimitInfo.remainingTime > 0) {
      const stateToSave: PersistedRateLimitState = {
        isRateLimited: rateLimitInfo.isRateLimited,
        remainingTime: rateLimitInfo.remainingTime,
        resetTime: rateLimitInfo.resetTime,
        timestamp: Date.now()
      };
      saveToStorage(STORAGE_KEYS.RATE_LIMIT_STATE, stateToSave);
    } else {
      clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
    }
  }, [rateLimitInfo]);

  // Sync cooldown timer with rate limit info
  useEffect(() => {
    setCooldownTimer(rateLimitInfo.remainingTime);
  }, [rateLimitInfo.remainingTime]);

  // Countdown timer
  useEffect(() => {
    if (cooldownTimer <= 0) return;

    const interval = setInterval(() => {
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

    return () => {
      clearInterval(interval);
    };
  }, [cooldownTimer, t]);

  const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
    setFilters(prev => ({ 
      ...prev, 
      startDate: startDate || undefined, 
      endDate: endDate || undefined 
    }));
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error(t('selectDateRangeError'), { duration: 3000 });
      return;
    }
    
    if (rateLimitInfo.isRateLimited) {
      toast.error(
        t('rateLimitMessage', { time: `${rateLimitInfo.remainingTime}s` }), 
        { duration: 8000 }
      );
      return;
    }
    
    const currentData = persistedData;
    
    try {
      setIsGenerating(true);
      clearStorage(STORAGE_KEYS.INSIGHTS_DATA);
      setPersistedData(null);
      
      const result = await insightsAPI.getAIInsights(filters);
      
      const dataToSave: PersistedInsightData = {
        insights: result.insights,
        dataAnalyzed: result.dataAnalyzed,
        timestamp: Date.now(),
        filters: { ...filters }
      };
      
      setPersistedData(dataToSave);
      saveToStorage(STORAGE_KEYS.INSIGHTS_DATA, dataToSave);
      toast.success(result.message, { duration: 3000 });
      
    } catch (error) {
      const axiosError = error as AxiosError<RateLimitErrorResponse>;
      
      if (axiosError.response?.status === 429) {
        const errorData = axiosError.response.data;
        
        // Restore previous data if available
        if (currentData) {
          setPersistedData(currentData);
          saveToStorage(STORAGE_KEYS.INSIGHTS_DATA, currentData);
        }
        
        if (errorData?.remainingTime) {
          setRateLimitInfo({
            isRateLimited: true,
            remainingTime: errorData.remainingTime,
            resetTime: errorData.resetTime
          });
          setCooldownTimer(errorData.remainingTime);
          toast.error(
            t('rateLimitMessage', { time: `${errorData.remainingTime}s` }),
            { duration: 8000 }
          );
        } else {
          toast.error(errorData?.message ?? t('rateLimitActive'), { duration: 5000 });
        }
      } else {
        toast.error(t('errorGeneratingInsights'), { duration: 3000 });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [filters, persistedData, rateLimitInfo.isRateLimited, rateLimitInfo.remainingTime, t]);

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