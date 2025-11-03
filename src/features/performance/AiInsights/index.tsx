import React from 'react';
import { auditLogApi } from '@/services/auditLog.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from 'react-i18next';

import useAiInsights from './hooks/useAiInsights';
import KPICards from './components/KPICards';
import AlertsCard from './components/AlertsCard';
import RecommendationsGrid from './components/RecommendationsGrid';
import LoadingOverlay from './components/LoadingOverlay';
import RateLimitBanner from './components/RateLimitBanner';

import NoDataState from './components/NoDataState';
import FiltersSection from './components/FiltersSection';
import AssignmentMetricsCard from './components/AssignmentMetricsCard';
import { buildAiInsightsCsv } from './data/exportToCsv';

export const AIInsightsDashboard: React.FC = () => {
  const { t } = useTranslation(['aiInsights']);
  const {
    filters,
    persistedData,
    rateLimitInfo,
    cooldownTimer,
    isGenerating,
    hasValidFilters,
    handleDateRangeChange,
    handleRefresh,
  } = useAiInsights(t);


  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const exportToCSV = async () => {
    if (!persistedData?.insights) return;
    const csv = buildAiInsightsCsv((k) => t(k), { insights: persistedData.insights, dataAnalyzed: persistedData.dataAnalyzed });


    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-report-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);


    try {
      await auditLogApi.logPerformanceAiInsightsExport({
        dataAnalyzed,
        insightsGenerated: !!insights,
      });
    } catch (error) {
      console.error('Failed to log export action:', error);
    }

    toast.success(t('exportSuccess'), {
      duration: 3000,
    });
  };

  const insights = persistedData?.insights;
  const dataAnalyzed = persistedData?.dataAnalyzed;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative">

      <LoadingOverlay visible={isGenerating} />


      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!insights} className="text-xs sm:text-sm px-2 sm:px-3">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isGenerating || rateLimitInfo.isRateLimited || !hasValidFilters}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            {rateLimitInfo.isRateLimited ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                {t('wait')} {formatTime(cooldownTimer)}
              </>
            ) : (
              <>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {t('generateReport')}
              </>
            )}
          </Button>
        </div>
      </div>


      <RateLimitBanner isVisible={!rateLimitInfo.isRateLimited} cooldownText={formatTime(cooldownTimer)} canQuickExport={!!persistedData?.insights} onExport={exportToCSV} />


      <FiltersSection
        filters={filters}
        onChangeDateRange={handleDateRangeChange}
        dataAnalyzed={dataAnalyzed || null}
      />


      {!insights ? (
        <NoDataState onGenerate={handleRefresh} hasFilters={hasValidFilters} />
      ) : (
        <>
          <KPICards 
            overallEfficiency={insights.kpis.overallEfficiency} 
            qualityScore={insights.kpis.qualityScore} 
            productivityTrend={insights.kpis.productivityTrend} 
            riskLevel={insights.kpis.riskLevel} 
          />

          {dataAnalyzed?.totalAssignments !== undefined && (
            <AssignmentMetricsCard 
              metrics={{
                totalAssignments: dataAnalyzed.totalAssignments,
                assignmentCompliance: dataAnalyzed.assignmentCompliance || '0%',
              }}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('executiveSummary')}</CardTitle>
              <CardDescription>{t('executiveSummaryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{insights.summary}</p>
            </CardContent>
          </Card>


          <AlertsCard alerts={insights.alerts} />
          

          <RecommendationsGrid recommendations={insights.recommendations} />
        </>
      )}
    </div>
  );
};

export default AIInsightsDashboard;