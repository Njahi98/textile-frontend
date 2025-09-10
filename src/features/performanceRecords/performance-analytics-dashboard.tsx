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
  Activity, Loader2, RefreshCw,
  CalendarIcon
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
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


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
  if (!analytics || !chartData.length) return;
  
  const csvContent: string[] = [];
  
  // Helper function to escape CSV content
  const escapeCSV = (content: string | number) => {
    const str = String(content);
    return `"${str.replace(/"/g, '""')}"`;
  };
  
  // Helper function to add section headers
  const addSectionHeader = (title: string, description?: string) => {
    csvContent.push('');
    csvContent.push(escapeCSV(`=== ${title.toUpperCase()} ===`));
    if (description) {
      csvContent.push(escapeCSV(description));
    }
    csvContent.push('');
  };

  // Report Header
  csvContent.push(escapeCSV('PERFORMANCE ANALYTICS REPORT'));
  csvContent.push(escapeCSV(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`));
  csvContent.push(escapeCSV(`Date Range: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`));
  csvContent.push(escapeCSV(`Analysis grouped by: ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`));
  
  // Add applied filters
  const appliedFilters: string[] = [];
  if (workerId) appliedFilters.push(`Worker ID: ${workerId}`);
  if (productionLineId) appliedFilters.push(`Production Line ID: ${productionLineId}`);
  
  if (appliedFilters.length > 0) {
    csvContent.push(escapeCSV(`Applied Filters: ${appliedFilters.join(', ')}`));
  }
  
  // Executive Summary Section
  addSectionHeader('EXECUTIVE SUMMARY', 'Key performance indicators');
  csvContent.push([
    'Metric',
    'Value',
    'Description'
  ].map(escapeCSV).join(','));
  
  csvContent.push([
    'Total Pieces Produced',
    analytics.overall.totalPieces.toLocaleString(),
    'Total production output across all records'
  ].map(escapeCSV).join(','));
  
  csvContent.push([
    'Average Error Rate',
    `${analytics.overall.avgErrorRate.toFixed(2)}%`,
    'Quality metric - lower is better'
  ].map(escapeCSV).join(','));
  
  csvContent.push([
    'Average Time Taken',
    `${analytics.overall.avgTimeTaken.toFixed(1)} hours`,
    'Efficiency metric - time per production cycle'
  ].map(escapeCSV).join(','));
  
  csvContent.push([
    'Total Records Analyzed',
    analytics.overall.totalRecords.toLocaleString(),
    'Number of data points in this analysis'
  ].map(escapeCSV).join(','));
  
  csvContent.push([
    'Data Quality Score',
    chartData.length > 0 ? 'Good' : 'Poor',
    `${chartData.length} valid data points processed`
  ].map(escapeCSV).join(','));

  // Performance Analysis Section
  addSectionHeader('DETAILED PERFORMANCE DATA', `Breakdown by ${groupBy}`);
  
  // Dynamic headers based on groupBy
  const detailHeaders = ['Rank'];
  
  if (groupBy === 'date') {
    detailHeaders.push('Date');
  } else {
    detailHeaders.push('ID', 'Name');
    if (groupBy === 'product') detailHeaders.push('Product Code');
    if (groupBy === 'productionLine') detailHeaders.push('Location');
  }
  
  detailHeaders.push(
    'Pieces Produced',
    'Error Rate (%)',
    'Time Taken (hours)',
    'Records Count',
    'Quality Rating'
  );
  
  if (groupBy === 'worker') detailHeaders.push('Efficiency Score');
  if (groupBy === 'productionLine') detailHeaders.push('Utilization (%)');
  
  csvContent.push(detailHeaders.map(escapeCSV).join(','));
  
  // Sort data by pieces produced for ranking
  const sortedData = [...chartData]
    .sort((a, b) => b.pieces - a.pieces)
    .map((item, index) => {
      const row = [index + 1]; // Rank
      
      if (groupBy === 'date') {
        row.push(item.date || 'Unknown');
      } else {
        row.push(
          item.id?.toString() || 'N/A',
          item.name || 'Unknown'
        );
        if (groupBy === 'product') row.push(item.code || 'N/A');
        if (groupBy === 'productionLine') row.push(item.location || 'N/A');
      }
      
      // Core metrics
      row.push(
        item.pieces.toLocaleString(),
        item.errorRate.toFixed(2),
        item.timeTaken.toFixed(1),
        item.records.toString()
      );
      
      // Quality rating
      const qualityRating = item.errorRate < 2 ? 'Excellent' :
                           item.errorRate < 5 ? 'Good' :
                           item.errorRate < 10 ? 'Fair' : 'Poor';
      row.push(qualityRating);
      
      // Additional metrics based on groupBy
      if (groupBy === 'worker' && item.efficiency !== undefined) {
        row.push(item.efficiency.toFixed(2));
      }
      if (groupBy === 'productionLine' && item.utilization !== undefined) {
        row.push(item.utilization.toFixed(1));
      }
      
      return row.map(escapeCSV).join(',');
    });
  
  csvContent.push(...sortedData);

  // Top Performers Section
  if (topPerformers.length > 0) {
    addSectionHeader('TOP PERFORMERS ANALYSIS', 'Best performing entities in this period');
    
    csvContent.push([
      'Rank',
      'Entity',
      'Pieces Produced',
      'Error Rate (%)',
      'Time Efficiency (hours)',
      'Quality Rating',
      'Performance Score'
    ].map(escapeCSV).join(','));
    
    topPerformers.forEach((performer, index) => {
      const performanceScore = (
        (performer.pieces / Math.max(...topPerformers.map(p => p.pieces))) * 50 + // Production weight (50%)
        ((10 - performer.errorRate) / 10) * 30 + // Quality weight (30%)
        ((Math.max(...topPerformers.map(p => p.timeTaken)) - performer.timeTaken) / 
         Math.max(...topPerformers.map(p => p.timeTaken))) * 20 // Efficiency weight (20%)
      ).toFixed(1);
      
      const qualityRating = performer.errorRate < 2 ? 'Excellent' :
                           performer.errorRate < 5 ? 'Good' :
                           performer.errorRate < 10 ? 'Fair' : 'Poor';
      
      csvContent.push([
        index + 1,
        getDisplayName(performer),
        performer.pieces.toLocaleString(),
        performer.errorRate.toFixed(2),
        performer.timeTaken.toFixed(1),
        qualityRating,
        `${performanceScore}/100`
      ].map(escapeCSV).join(','));
    });
  }

  // Statistical Analysis Section
  addSectionHeader('STATISTICAL ANALYSIS', 'Data distribution and trends');
  
  const pieces = chartData.map(d => d.pieces);
  const errorRates = chartData.map(d => d.errorRate);
  const times = chartData.map(d => d.timeTaken);
  
  const stats = [
    ['Metric', 'Minimum', 'Maximum', 'Average', 'Median', 'Standard Deviation'],
    [
      'Pieces Produced',
      Math.min(...pieces).toLocaleString(),
      Math.max(...pieces).toLocaleString(),
      (pieces.reduce((a, b) => a + b, 0) / pieces.length).toFixed(1),
      pieces.sort((a, b) => a - b)[Math.floor(pieces.length / 2)].toFixed(1),
      Math.sqrt(pieces.reduce((acc, val) => acc + Math.pow(val - pieces.reduce((a, b) => a + b, 0) / pieces.length, 2), 0) / pieces.length).toFixed(1)
    ],
    [
      'Error Rate (%)',
      Math.min(...errorRates).toFixed(2),
      Math.max(...errorRates).toFixed(2),
      (errorRates.reduce((a, b) => a + b, 0) / errorRates.length).toFixed(2),
      errorRates.sort((a, b) => a - b)[Math.floor(errorRates.length / 2)].toFixed(2),
      Math.sqrt(errorRates.reduce((acc, val) => acc + Math.pow(val - errorRates.reduce((a, b) => a + b, 0) / errorRates.length, 2), 0) / errorRates.length).toFixed(2)
    ],
    [
      'Time Taken (hours)',
      Math.min(...times).toFixed(1),
      Math.max(...times).toFixed(1),
      (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1),
      times.sort((a, b) => a - b)[Math.floor(times.length / 2)].toFixed(1),
      Math.sqrt(times.reduce((acc, val) => acc + Math.pow(val - times.reduce((a, b) => a + b, 0) / times.length, 2), 0) / times.length).toFixed(1)
    ]
  ];
  
  stats.forEach(row => {
    csvContent.push(row.map(escapeCSV).join(','));
  });

  // Insights and Recommendations Section
  addSectionHeader('KEY INSIGHTS & RECOMMENDATIONS', 'AI-driven analysis and suggestions');
  
  const insights: string[] = [];
  
  // Production insights
  const avgPieces = pieces.reduce((a, b) => a + b, 0) / pieces.length;
  const highPerformers = pieces.filter(p => p > avgPieces * 1.2).length;
  const lowPerformers = pieces.filter(p => p < avgPieces * 0.8).length;
  
  insights.push(`Production Analysis: ${highPerformers} high performers (>20% above average), ${lowPerformers} underperformers (<20% below average)`);
  
  // Quality insights
  const avgError = errorRates.reduce((a, b) => a + b, 0) / errorRates.length;
  const qualityIssues = errorRates.filter(e => e > 5).length;
  insights.push(`Quality Analysis: ${qualityIssues} entities exceed 5% error rate threshold (${((qualityIssues/errorRates.length)*100).toFixed(1)}% of total)`);
  
  // Efficiency insights  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const slowProcesses = times.filter(t => t > avgTime * 1.3).length;
  insights.push(`Efficiency Analysis: ${slowProcesses} processes taking >30% longer than average (${((slowProcesses/times.length)*100).toFixed(1)}% of total)`);
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (qualityIssues > chartData.length * 0.2) {
    recommendations.push('PRIORITY: Address quality control - >20% of processes exceed error thresholds');
  }
  
  if (slowProcesses > chartData.length * 0.3) {
    recommendations.push('FOCUS: Optimize process efficiency - significant time variance detected');
  }
  
  if (lowPerformers > chartData.length * 0.25) {
    recommendations.push('ACTION: Investigate underperforming entities - 25%+ below average output');
  }
  
  if (topPerformers.length > 0 && topPerformers[0].pieces > avgPieces * 2) {
    recommendations.push('OPPORTUNITY: Study top performer practices for scaling best practices');
  }
  
  insights.forEach(insight => {
    csvContent.push(escapeCSV(`INSIGHT: ${insight}`));
  });
  
  csvContent.push('');
  recommendations.forEach(rec => {
    csvContent.push(escapeCSV(`RECOMMENDATION: ${rec}`));
  });

  // Footer
  csvContent.push('');
  csvContent.push('');
  csvContent.push(escapeCSV('=== END OF REPORT ==='));
  csvContent.push(escapeCSV(`Report exported on: ${new Date().toLocaleString()}`));
  csvContent.push(escapeCSV('Generated by Performance Analytics Dashboard'));
  csvContent.push(escapeCSV(`Data points analyzed: ${chartData.length} | Total production records: ${analytics.overall.totalRecords}`));

  // Create and download the CSV
  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-analytics-comprehensive-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Show success message
  toast.success(`Detailed performance analytics report with ${chartData.length} data points and statistical analysis has been downloaded.`, {
    duration: 4000,
  });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First row: Date Range and Group By */}
          <div className="space-y-2 md:col-span-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date || dateRange.from })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date || dateRange.to })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
       
       
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