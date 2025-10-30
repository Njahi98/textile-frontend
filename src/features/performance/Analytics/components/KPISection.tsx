import React from 'react';
import KPIStatsCard from './KPIStatsCard';
import { Package, AlertCircle, Clock, Activity } from 'lucide-react';

interface KPISectionProps {
  analytics: {
    overall: {
      totalPieces: number;
      avgErrorRate: number;
      avgTimeTaken: number;
      totalRecords: number;
    }
  };
  t: (k: string) => string;
  trendTotalPieces?: number;
}

const KPISection: React.FC<KPISectionProps> = ({ analytics, t, trendTotalPieces }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <KPIStatsCard
        title={t('kpis.totalPieces')}
        value={analytics.overall.totalPieces.toLocaleString()}
        description={t('kpis.productionOutput')}
        icon={<Package className="h-4 w-4" />}
        trend={typeof trendTotalPieces === 'number' ? Number(trendTotalPieces.toFixed(0)) : undefined}
      />
      <KPIStatsCard
        title={t('kpis.errorRate')}
        value={`${analytics.overall.avgErrorRate.toFixed(2)}%`}
        description={t('kpis.qualityMetric')}
        icon={<AlertCircle className="h-4 w-4" />}
        className={
          analytics.overall.avgErrorRate < 2 ? 'border-green-200 dark:border-green-900' :
          analytics.overall.avgErrorRate >= 5 ? 'border-red-200 dark:border-red-900' : ''
        }
      />
      <KPIStatsCard
        title={t('kpis.avgTime')}
        value={`${analytics.overall.avgTimeTaken.toFixed(1)}h`}
        description={t('kpis.efficiencyMetric')}
        icon={<Clock className="h-4 w-4" />}
      />
      <KPIStatsCard
        title={t('kpis.records')}
        value={analytics.overall.totalRecords.toLocaleString()}
        description={t('kpis.dataPoints')}
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  );
};

export default KPISection;
