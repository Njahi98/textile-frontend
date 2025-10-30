import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import usePerformanceAnalytics from './hooks/usePerformanceAnalytics';
import KPISection from './components/KPISection';
import FiltersSection from './components/FiltersSection';
import ErrorAlert from './components/ErrorAlert';
import EmptyStateCard from './components/EmptyStateCard';
import TopPerformersCard from './components/TopPerformersCard';
import ChartsTabs from './components/ChartsTabs';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { performanceApi } from '@/services/performance.api';
import { ChartDataItem, GroupedByDate, GroupedByProduct, GroupedByProductionLine, GroupedByWorker } from './data/chartData';

export default function PerformanceAnalytics() {
  const { t } = useTranslation(['performanceAnalytics']);
  const {
    loading, analytics, error,
    dateRange, setDateRange,
    groupBy, setGroupBy,
    workerId, setWorkerId,
    productionLineId, setProductionLineId,
    fetchAnalytics,
  } = usePerformanceAnalytics();

  const chartData = useMemo<ChartDataItem[]>(() => {
    if (!analytics?.grouped) return [];
    
    if (groupBy === 'date') {
      return (analytics.grouped as GroupedByDate[]).map((item) => {
        const dateValue = new Date(item.date);
        const formattedDate = !isNaN(dateValue.getTime()) ? format(dateValue, 'MMM dd') : 'Invalid Date';
        return {
          date: formattedDate,
          pieces: item._sum?.piecesMade ?? 0,
          errorRate: item._avg?.errorRate ?? 0,
          timeTaken: item._avg?.timeTaken ?? 0,
          records: item._count ?? 0
        };
      });
    } else if (groupBy === 'worker') {
      return (analytics.grouped as GroupedByWorker[]).map((item) => ({
        id: item.workerId,
        name: item.worker?.name ?? `Worker #${item.workerId ?? 'Unknown'}`,
        pieces: item._sum?.piecesMade ?? 0,
        errorRate: item._avg?.errorRate ?? 0,
        timeTaken: item._avg?.timeTaken ?? 0,
        records: item._count ?? 0,
        efficiency: item._sum?.piecesMade && item._avg?.timeTaken 
          ? ((item._sum.piecesMade / item._avg.timeTaken) * (100 - (item._avg.errorRate ?? 0))) / 100 
          : 0,
      }));
    } else if (groupBy === 'product') {
      return (analytics.grouped as GroupedByProduct[]).map((item) => ({
        id: item.productId,
        name: item.product?.name ?? `Product #${item.productId ?? 'Unknown'}`,
        code: item.product?.code ?? '',
        pieces: item._sum?.piecesMade ?? 0,
        errorRate: item._avg?.errorRate ?? 0,
        timeTaken: item._avg?.timeTaken ?? 0,
        records: item._count ?? 0,
      }));
    } else if (groupBy === 'productionLine') {
      return (analytics.grouped as GroupedByProductionLine[]).map((item) => ({
        id: item.productionLineId,
        name: item.productionLine?.name ?? `Line #${item.productionLineId ?? 'Unknown'}`,
        location: item.productionLine?.location ?? '',
        pieces: item._sum?.piecesMade ?? 0,
        errorRate: item._avg?.errorRate ?? 0,
        timeTaken: item._avg?.timeTaken ?? 0,
        records: item._count ?? 0,
        utilization: item.productionLine?.capacity && item._sum?.piecesMade 
          ? (item._sum.piecesMade / item.productionLine.capacity) * 100 
          : 0,
      }));
    }
    return [];
  }, [analytics, groupBy]);

  const topPerformers = useMemo(() => {
    if (!chartData.length) return [];
    return [...chartData].filter(item => item.pieces > 0).sort((a, b) => b.pieces - a.pieces).slice(0, 5);
  }, [chartData]);

  const trendTotalPieces = useMemo(() => {
    if (chartData.length < 2) return undefined;
    const last = chartData[chartData.length - 1]?.pieces ?? 0;
    const prev = chartData[chartData.length - 2]?.pieces ?? 0;
    if (prev === 0) return undefined;
    return ((last - prev) / prev) * 100;
  }, [chartData]);

  const handleExport = useCallback(async () => {
    if (!analytics || !chartData.length) return;
    try {
      const blob = await performanceApi.exportPerformanceAnalyticsCsv({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        groupBy,
        ...(workerId && { workerId }),
        ...(productionLineId && { productionLineId }),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-comprehensive-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t('export.success', { count: chartData.length }), { duration: 4000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export data';
      toast.error(message);
    }
  }, [analytics, chartData, dateRange, groupBy, workerId, productionLineId, t]);

  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-4 lg:p-8 pt-4 md:pt-6">
      <div className="space-y-3">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">{t('header.title')}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">{t('header.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => void handleExport()} 
              disabled={!chartData.length} 
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('buttons.export')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => void fetchAnalytics()} 
              disabled={loading} 
              className="w-full sm:w-auto"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")}/>
              {t('buttons.refresh')}
            </Button>
          </div>
        </div>
      </div>
      <FiltersSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        groupBy={groupBy}
        setGroupBy={(v: string) => setGroupBy(v as 'date' | 'worker' | 'product' | 'productionLine')}
        workerId={workerId}
        setWorkerId={setWorkerId}
        productionLineId={productionLineId}
        setProductionLineId={setProductionLineId}
        onFilter={() => void fetchAnalytics()}
        loading={loading}
        t={t}
      />
      <ErrorAlert error={error} onRetry={() => void fetchAnalytics()} />
      {analytics && (
        <>
          <KPISection analytics={analytics} t={t} trendTotalPieces={trendTotalPieces} />
          {chartData.length === 0 && (
            <EmptyStateCard groupBy={groupBy} analytics={analytics} t={t} onRetry={() => void fetchAnalytics()} />
          )}
          {chartData.length > 0 && (
            <>
              <ChartsTabs chartData={chartData} groupBy={groupBy} t={t} />
              <TopPerformersCard topPerformers={topPerformers} groupBy={groupBy} t={t} />
            </>
          )}
        </>
      )}
    </div>
  );
}