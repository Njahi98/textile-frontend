import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { 
  DashboardStats, 
  ProductionMetric, 
  WorkerPerformance,
  RecentActivities,
  ProductionTrends 
} from '@/services/dashboard.api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/error-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Users, 
  Factory, 
  Package,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface StatsResponse {
  success: boolean;
  stats: DashboardStats;
}

interface MetricsResponse {
  success: boolean;
  metrics: ProductionMetric[];
}

interface PerformanceResponse {
  success: boolean;
  topPerformers: WorkerPerformance[];
}

interface ActivitiesResponse {
  success: boolean;
  activities: RecentActivities;
}

interface TrendsResponse {
  success: boolean;
  trends: ProductionTrends;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue 
}: { 
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : trend === 'down' ? (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const { data: statsData, error: statsError, isLoading: statsLoading } = 
    useSWR<StatsResponse>('/api/dashboard/stats', fetcher, { refreshInterval: 30000 });

  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = 
    useSWR<MetricsResponse>('/api/dashboard/production-metrics', fetcher, { refreshInterval: 30000 });

  const { data: performanceData, error: performanceError, isLoading: performanceLoading } = 
    useSWR<PerformanceResponse>('/api/dashboard/worker-performance', fetcher, { refreshInterval: 30000 });

  const { data: activitiesData, error: activitiesError, isLoading: activitiesLoading } = 
    useSWR<ActivitiesResponse>('/api/dashboard/recent-activities', fetcher, { refreshInterval: 60000 });

  const { data: trendsData, error: trendsError, isLoading: trendsLoading } = 
    useSWR<TrendsResponse>('/api/dashboard/production-trends', fetcher, { refreshInterval: 60000 });

  if (statsLoading || metricsLoading || performanceLoading) {
    return <LoadingSpinner />;
  }

  if (statsError || metricsError || performanceError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="An error occurred while loading the dashboard data."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const stats = statsData?.stats;
  const metrics = metricsData?.metrics || [];
  const topPerformers = performanceData?.topPerformers || [];
  const activities = activitiesData?.activities;
  const trends = trendsData?.trends;

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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workers"
          value={stats?.workers.total || 0}
          description={`${stats?.workers.activeToday || 0} active today`}
          icon={Users}
          trend={stats?.workers.activeToday > 0 ? 'up' : 'neutral'}
          trendValue={`${stats?.workers.activeToday || 0} working`}
        />
        <StatCard
          title="Production Lines"
          value={stats?.productionLines.active || 0}
          description={`of ${stats?.productionLines.total || 0} total lines`}
          icon={Factory}
        />
        <StatCard
          title="Today's Production"
          value={(stats?.production.today.pieces || 0).toLocaleString()}
          description={`${stats?.production.today.avgErrorRate?.toFixed(2) || 0}% error rate`}
          icon={Package}
          trend={stats?.production.today.pieces > 0 ? 'up' : 'neutral'}
          trendValue={`${stats?.production.today.records || 0} records`}
        />
        <StatCard
          title="Month Production"
          value={(stats?.production.month.pieces || 0).toLocaleString()}
          description={`${stats?.production.month.records || 0} total records`}
          icon={TrendingUp}
        />
      </div>

      {/* Production Trends and Top Performers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Production Trends Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Production Trends</CardTitle>
            <CardDescription>Last 7 days production overview</CardDescription>
          </CardHeader>
          <CardContent>
            {trends?.data && trends.data.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.data}>
                    <defs>
                      <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={formatDate}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="production"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorProduction)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            {trends?.summary && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Production</p>
                  <p className="text-lg font-semibold">{trends.summary.totalProduction.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-lg font-semibold">{Math.round(trends.summary.avgDailyProduction).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className={`text-lg font-semibold ${trends.summary.trendPercentage > 0 ? 'text-green-500' : trends.summary.trendPercentage < 0 ? 'text-red-500' : ''}`}>
                    {trends.summary.trendPercentage > 0 ? '+' : ''}{trends.summary.trendPercentage}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Performers Today</CardTitle>
            <CardDescription>Highest producing workers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.worker?.id || index} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {performer.worker?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {performer.worker?.cin || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {performer.production.toLocaleString()} pcs
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {performer.avgErrorRate.toFixed(1)}% error
                    </p>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No performance data for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Line Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Production Line Performance</CardTitle>
          <CardDescription>Today's production metrics by line</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.productionLine?.id || Math.random()} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {metric.productionLine?.name || 'Unknown Line'}
                      </span>
                      {metric.productionLine?.isActive ? (
                        <Badge variant="default" className="h-5">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">{metric.production.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">pcs</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className={`font-medium ${metric.avgErrorRate > 5 ? 'text-red-500' : ''}`}>
                          {metric.avgErrorRate.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground ml-1">error</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">{metric.avgTimeTaken.toFixed(1)}</span>
                        <span className="text-muted-foreground ml-1">min</span>
                      </div>
                    </div>
                  </div>
                  {metric.efficiency !== null && metric.productionLine?.targetOutput && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency</span>
                        <span>{metric.efficiency.toFixed(1)}% of target ({metric.productionLine.targetOutput.toLocaleString()} pcs)</span>
                      </div>
                      <Progress 
                        value={Math.min(metric.efficiency, 100)} 
                        className={`h-2 ${
                          metric.efficiency >= 90 ? '[&>div]:bg-green-500' :
                          metric.efficiency >= 70 ? '[&>div]:bg-yellow-500' :
                          '[&>div]:bg-red-500'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No production data available for today
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Latest worker assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities?.assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {assignment.worker.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(assignment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {assignment.productionLine.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {assignment.position}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {assignment.shift}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!activities?.assignments || activities.assignments.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No recent assignments
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Latest production records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities?.performanceRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {record.worker.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(record.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {record.product.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{record.piecesMade} pcs</span>
                      <span className={`${record.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {record.errorRate.toFixed(1)}% error
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!activities?.performanceRecords || activities.performanceRecords.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No recent records
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Workers */}
        <Card>
          <CardHeader>
            <CardTitle>New Workers</CardTitle>
            <CardDescription>Recently added to system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities?.newWorkers.slice(0, 5).map((worker) => (
                <div key={worker.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">{worker.cin}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {worker.role || 'No Role'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(worker.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {(!activities?.newWorkers || activities.newWorkers.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No new workers recently
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}