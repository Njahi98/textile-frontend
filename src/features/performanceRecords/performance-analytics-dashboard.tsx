import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, ScatterChart, Scatter
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle,
  Download, Filter, Package, Clock,
  Activity, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { performanceApi } from '@/services/performance.api';
import type { PerformanceAnalytics, AnalyticsQueryParams } from '@/services/performance.api';


interface DateRange {
  from: Date;
  to: Date;
}

interface ChartDataItem {
  id?: number;
  date?: string;
  name?: string;
  code?: string;
  location?: string;
  pieces: number;
  errorRate: number;
  timeTaken: number;
  records: number;
  efficiency?: number;
  utilization?: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon, trend, className }) => {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn("text-xs", trend >= 0 ? "text-green-500" : "text-red-500")}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
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
        ...(productionLineId && { productionLineId })
      };
      
      const response = await performanceApi.getPerformanceAnalytics(params);
      
      // Validate the response structure
      if (!response.analytics || !response.analytics.overall || !response.analytics.grouped) {
        throw new Error('Invalid analytics data structure received');
      }
      
      setAnalytics(response.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [groupBy, workerId, productionLineId, dateRange.from, dateRange.to]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = useMemo((): ChartDataItem[] => {
    if (!analytics?.grouped) {
      return [];
    }
if (groupBy === 'date') {
  return analytics.grouped.map((item: any): ChartDataItem => {
    // Ensure item.date is a valid date
    const dateValue = new Date(item.date);
    const formattedDate = !isNaN(dateValue.getTime()) ? format(dateValue, 'MMM dd') : 'Invalid Date';
    
    return {
      date: formattedDate,
      pieces: item._sum?.piecesMade || 0,
      errorRate: item._avg?.errorRate || 0,
      timeTaken: item._avg?.timeTaken || 0,
      records: item._count || 0
    };
  });
    } else if (groupBy === 'worker') {
      return analytics.grouped.map((item: any): ChartDataItem => {
        return {
          id: item.workerId,
          name: item.worker?.name || `Worker #${item.workerId || 'Unknown'}`,
          pieces: item._sum?.piecesMade || 0,
          errorRate: item._avg?.errorRate || 0,
          timeTaken: item._avg?.timeTaken || 0,
          records: item._count || 0,
          efficiency: item._sum?.piecesMade && item._avg?.timeTaken ? 
            ((item._sum.piecesMade / item._avg.timeTaken) * (100 - item._avg.errorRate)) / 100 : 0
        };
      });
    } else if (groupBy === 'product') {
      return analytics.grouped.map((item: any): ChartDataItem => {
        return {
          id: item.productId,
          name: item.product?.name || `Product #${item.productId || 'Unknown'}`,
          code: item.product?.code || '',
          pieces: item._sum?.piecesMade || 0,
          errorRate: item._avg?.errorRate || 0,
          timeTaken: item._avg?.timeTaken || 0,
          records: item._count || 0
        };
      });
    } else if (groupBy === 'productionLine') {
      return analytics.grouped.map((item: any): ChartDataItem => {
        return {
          id: item.productionLineId,
          name: item.productionLine?.name || `Line #${item.productionLineId || 'Unknown'}`,
          location: item.productionLine?.location || '',
          pieces: item._sum?.piecesMade || 0,
          errorRate: item._avg?.errorRate || 0,
          timeTaken: item._avg?.timeTaken || 0,
          records: item._count || 0,
          utilization: item.productionLine?.capacity && item._sum?.piecesMade ? 
            (item._sum.piecesMade / item.productionLine.capacity) * 100 : 0
        };
      });
    }
    
    return [];
  }, [analytics, groupBy]);

  const topPerformers = useMemo(() => {
    if (!chartData.length) return [];
    return [...chartData]
      .filter(item => item.pieces > 0) // Only include items with actual production
      .sort((a, b) => b.pieces - a.pieces)
      .slice(0, 5);
  }, [chartData]);

  const getErrorRateBadge = (rate: number) => {
    if (rate < 2) return { variant: 'default' as const, text: 'Excellent' };
    if (rate < 5) return { variant: 'secondary' as const, text: 'Good' };
    if (rate < 10) return { variant: 'outline' as const, text: 'Fair' };
    return { variant: 'destructive' as const, text: 'Poor' };
  };

  const getDisplayName = (item: ChartDataItem) => {
    return item.date || item.name || 'Unknown';
  };

  const exportToCSV = () => {
    if (!chartData.length) return;
    
    const headers = Object.keys(chartData[0]).join(',');
    const rows = chartData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Real-time insights into production line performance and efficiency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!chartData.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                />
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Group By</Label>
              <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="productionLine">Production Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Worker ID (Optional)</Label>
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="Enter worker ID"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Production Line ID (Optional)</Label>
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="Enter line ID"
                value={productionLineId}
                onChange={(e) => setProductionLineId(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={fetchAnalytics} disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Pieces Produced"
              value={analytics.overall.totalPieces.toLocaleString()}
              description="Total production output"
              icon={<Package className="h-4 w-4" />}
              trend={12}
            />
            <KPICard
              title="Average Error Rate"
              value={`${analytics.overall.avgErrorRate.toFixed(2)}%`}
              description="Quality metric"
              icon={<AlertCircle className="h-4 w-4" />}
              className={cn(
                analytics.overall.avgErrorRate < 2 && "border-green-200 dark:border-green-900",
                analytics.overall.avgErrorRate >= 5 && "border-red-200 dark:border-red-900"
              )}
            />
            <KPICard
              title="Average Time"
              value={`${analytics.overall.avgTimeTaken.toFixed(1)}h`}
              description="Efficiency metric"
              icon={<Clock className="h-4 w-4" />}
            />
            <KPICard
              title="Total Records"
              value={analytics.overall.totalRecords.toLocaleString()}
              description="Data points collected"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>

          {/* Empty State */}
          {chartData.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No performance records found for the selected date range and filters.
                  <br />
                  Current groupBy: <strong>{groupBy}</strong>
                  <br />
                  Raw data items: <strong>{analytics.grouped?.length || 0}</strong>
                </p>
                <Button onClick={fetchAnalytics} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Charts Section - Only show if we have data */}
          {chartData.length > 0 && (
            <Tabs defaultValue="production" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

            <TabsContent value="production" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Production Trends</CardTitle>
                  <CardDescription>
                    {groupBy === 'date' ? 'Daily production output' : `Production by ${groupBy}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    {groupBy === 'date' ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPieces" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="pieces"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorPieces)"
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="name" 
                          className="text-xs" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          interval={0}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="pieces" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Analysis</CardTitle>
                  <CardDescription>Quality metrics and defect rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey={groupBy === 'date' ? 'date' : 'name'} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="errorRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                        name="Error Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="efficiency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Efficiency</CardTitle>
                  <CardDescription>Average time taken for production</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey={groupBy === 'date' ? 'date' : 'name'} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="timeTaken" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Comparison</CardTitle>
                  <CardDescription>Pieces produced vs Error rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="pieces" name="Pieces" className="text-xs" />
                      <YAxis dataKey="errorRate" name="Error Rate" className="text-xs" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Performance" data={chartData} fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}

          {/* Top Performers Table - Only show if we have data */}
          {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Highest production output {groupBy !== 'date' && `by ${groupBy}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id || index} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {getDisplayName(performer)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {performer.pieces.toLocaleString()} pieces
                        {performer.code && ` • Code: ${performer.code}`}
                        {performer.location && ` • ${performer.location}`}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <Badge {...getErrorRateBadge(performer.errorRate)}>
                        {performer.errorRate.toFixed(1)}% error
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {performer.timeTaken.toFixed(1)}h avg time
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </>
      )}
    </div>
  );
}