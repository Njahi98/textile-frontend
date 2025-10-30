import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/error-state';
import StatCard from './components/StatCard';
import ProductionTrends from './components/ProductionTrends';
import TopPerformers from './components/TopPerformers';
import ProductionLines from './components/ProductionLines';
import RecentAssignments from './components/RecentAssignments';
import RecentPerformance from './components/RecentPerformance';
import NewWorkers from './components/NewWorkers';
import { Users, Factory, Package, TrendingUp } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';

export default function DashboardHome() {
  const dashboard = useDashboardData();
  const { t } = useTranslation(['dashboard']);

  if (dashboard.statsLoading || dashboard.metricsLoading || dashboard.performanceLoading) {
    return <LoadingSpinner />;
  }

  if (dashboard.statsError || dashboard.metricsError || dashboard.performanceError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="An error occurred while loading the dashboard data."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const stats = dashboard.statsData?.stats;
  const metrics = dashboard.metricsData?.metrics ?? [];
  const topPerformers = dashboard.performanceData?.topPerformers ?? [];
  const activities = dashboard.activitiesData?.activities;
  const trends = dashboard.trendsData?.trends;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
       <StatCard
  title={t('stats.totalWorkers')}
  value={stats?.workers.total ?? 0}
  description={t('stats.activeToday', { count: stats?.workers.activeToday ?? 0 })}
  icon={Users}
  trend={(stats?.workers.activeToday ?? 0) > 0 ? 'up' : 'neutral'}
  trendValue={t('stats.working', { count: stats?.workers.activeToday ?? 0 })}
/>
<StatCard
  title={t('stats.productionLines')}
  value={stats?.productionLines.active ?? 0}
  description={t('stats.ofTotal', { active: stats?.productionLines.active ?? 0, total: stats?.productionLines.total ?? 0 })}
  icon={Factory}
/>
<StatCard
  title={t('stats.todayProduction')}
  value={(stats?.production.today.pieces ?? 0).toLocaleString()}
  description={t('stats.errorRate', { rate: stats?.production.today.avgErrorRate?.toFixed(2) ?? 0 })}
  icon={Package}
  trend={(stats?.production.today.pieces ?? 0) > 0 ? 'up' : 'neutral'}
  trendValue={t('stats.records', { count: stats?.production.today.records ?? 0 })}
/>
<StatCard
  title={t('stats.monthProduction')}
  value={(stats?.production.month.pieces ?? 0).toLocaleString()}
  description={t('stats.totalRecords', { count: stats?.production.month.records ?? 0 })}
  icon={TrendingUp}
/>
      </div>

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ProductionTrends trends={trends} formatDate={formatDate} />
        <TopPerformers performers={topPerformers} />
      </div>

     
      <ProductionLines metrics={metrics} />

      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <RecentAssignments assignments={activities?.assignments ?? []} formatTime={formatTime} />
        <RecentPerformance records={activities?.performanceRecords ?? []} formatTime={formatTime} />
        <NewWorkers workers={activities?.newWorkers ?? []} formatDate={formatDate} />
      </div>
    </div>
  );
}