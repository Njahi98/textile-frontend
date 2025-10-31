import { useState, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { performanceApi } from '@/services/performance.api';
import type { PerformanceAnalytics, AnalyticsQueryParams } from '@/services/performance.api';

export interface DateRange { from: Date; to: Date; }

export default function usePerformanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [groupBy, setGroupBy] = useState<'date' | 'worker' | 'product' | 'productionLine'>('date');
  const [workerId, setWorkerId] = useState<string>('');
  const [productionLineId, setProductionLineId] = useState<string>('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AnalyticsQueryParams = {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        groupBy,
        ...(workerId && { workerId }),
        ...(productionLineId && { productionLineId }),
      };
      const response = await performanceApi.getPerformanceAnalytics(params);
      if (!response.analytics || !response.analytics.overall || !response.analytics.grouped) {
        throw new Error('Invalid analytics data structure received');
      }
      setAnalytics(response.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      
    } finally {
      setLoading(false);
    }
  }, [groupBy, workerId, productionLineId, dateRange.from, dateRange.to]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return {
    loading,
    analytics,
    error,
    dateRange,
    setDateRange,
    groupBy,
    setGroupBy,
    workerId,
    setWorkerId,
    productionLineId,
    setProductionLineId,
    fetchAnalytics,
  };
}
