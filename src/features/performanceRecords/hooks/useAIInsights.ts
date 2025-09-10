import useSWR from 'swr';
import { InsightsFilters, insightsAPI, AIInsightResponse } from '@/services/insights.api';

const createInsightsKey = (filters: InsightsFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  return `/insights/ai-insights?${params.toString()}`;
};

export const useAIInsights = (filters: InsightsFilters = {}) => {
  const key = createInsightsKey(filters);
  
  // Disable automatic fetching by using null as the fetcher
  const fetcher = null; // This prevents automatic fetching
  
  const { data, error, isLoading, mutate } = useSWR<AIInsightResponse>(
    null, // Use null instead of key to prevent automatic fetching
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Disable auto-refetch on reconnect
      refreshInterval: 0, // Disable auto-refresh completely
      errorRetryCount: 0, // Disable retries
      dedupingInterval: 0, // Disable deduping
      shouldRetryOnError: false, // Don't retry on error
    }
  );

  // Manual refresh function that actually fetches data
  const manualRefresh = async () => {
    try {
      const result = await insightsAPI.getAIInsights(filters);
      // Manually trigger SWR update with the fetched data
      await mutate(result, { revalidate: false });
      return result;
    } catch (error) {
      // Let the error propagate to be handled by the component
      throw error;
    }
  };

  return {
    insights: data?.insights,
    dataAnalyzed: data?.dataAnalyzed,
    isLoading,
    error,
    refresh: manualRefresh, // Use our manual refresh function
  };
};