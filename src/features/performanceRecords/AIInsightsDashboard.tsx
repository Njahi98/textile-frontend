import React, { useState, useEffect } from 'react';
import { useAIInsights } from './hooks/useAIInsights';
import { InsightsFilters, insightsAPI, AIInsightResponse } from '@/services/insights.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, ShieldAlert, Info, Download, RefreshCw, Clock, FileX, PlayCircle, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Storage keys for persistence
const STORAGE_KEYS = {
  INSIGHTS_DATA: 'ai_insights_data',
  RATE_LIMIT_STATE: 'ai_insights_rate_limit',
  FILTERS_STATE: 'ai_insights_filters'
};

// Utility function to get priority color
const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Utility function to get risk level color
const getRiskColor = (level: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'high':
      return 'text-red-700 bg-red-100';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100';
    case 'low':
      return 'text-green-700 bg-green-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// Utility function to get trend color and icon
const getTrendDisplay = (trend: 'improving' | 'declining' | 'stable') => {
  switch (trend) {
    case 'improving':
      return { color: 'text-green-600', icon: '↗', label: 'Improving' };
    case 'declining':
      return { color: 'text-red-600', icon: '↘', label: 'Declining' };
    case 'stable':
      return { color: 'text-blue-600', icon: '→', label: 'Stable' };
    default:
      return { color: 'text-gray-600', icon: '—', label: 'Unknown' };
  }
};

const NoDataState: React.FC<{ onGenerate: () => void; hasFilters: boolean }> = ({ onGenerate, hasFilters }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardTitle className="text-xl font-semibold text-center mb-2">
        No AI Insights Available
      </CardTitle>
      <CardDescription className="text-center max-w-md mb-4">
        {hasFilters 
          ? "Select a date range and click 'Generate Report' to create AI-powered insights for your production data."
          : "Please select a date range first, then click 'Generate Report' to create AI-powered insights."
        }
      </CardDescription>
      {hasFilters && (
        <Button onClick={onGenerate} className="mt-2">
          <PlayCircle className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      )}
    </CardContent>
  </Card>
);

// Helper functions for persistence
const saveToStorage = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to sessionStorage:', error);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to load from sessionStorage:', error);
    return null;
  }
};

const clearStorage = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear from sessionStorage:', error);
  }
};

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

export const AIInsightsDashboard: React.FC = () => {
  // Initialize filters from storage or empty state
  const [filters, setFilters] = useState<InsightsFilters>(() => {
    return loadFromStorage(STORAGE_KEYS.FILTERS_STATE) || {};
  });

  // Initialize insights from storage
  const [persistedData, setPersistedData] = useState<PersistedInsightData | null>(() => {
    return loadFromStorage(STORAGE_KEYS.INSIGHTS_DATA);
  });

  // Initialize rate limit state from storage
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isRateLimited: boolean;
    remainingTime: number;
    resetTime?: number;
  }>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
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

  // Don't use the hook for automatic fetching - we'll manage this manually
  const { refresh } = useAIInsights(filters);

  // Save filters to storage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FILTERS_STATE, filters);
  }, [filters]);

  // Save rate limit state to storage whenever it changes
  useEffect(() => {
    if (rateLimitInfo.isRateLimited || rateLimitInfo.remainingTime > 0) {
      const stateToSave: PersistedRateLimitState = {
        ...rateLimitInfo,
        timestamp: Date.now()
      };
      saveToStorage(STORAGE_KEYS.RATE_LIMIT_STATE, stateToSave);
    } else {
      clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
    }
  }, [rateLimitInfo]);

  // Manual refresh function that handles rate limiting and persistence
  const handleRefresh = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Please select both start and end dates before generating the report.', {
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Clear old data when generating new report
      clearStorage(STORAGE_KEYS.INSIGHTS_DATA);
      setPersistedData(null);
      
      const result = await insightsAPI.getAIInsights(filters);
      
      // Save the new data to storage
      const dataToSave: PersistedInsightData = {
        insights: result.insights,
        dataAnalyzed: result.dataAnalyzed,
        timestamp: Date.now(),
        filters: { ...filters }
      };
      
      setPersistedData(dataToSave);
      saveToStorage(STORAGE_KEYS.INSIGHTS_DATA, dataToSave);
      
      toast.success( 'AI insights have been successfully generated for the selected date range.', {
        duration: 3000,
      });
      
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const errorData = err.response.data;
        
        if (errorData?.remainingTime) {
          const newRateLimitInfo = {
            isRateLimited: true,
            remainingTime: errorData.remainingTime,
            resetTime: errorData.resetTime
          };
          
          setRateLimitInfo(newRateLimitInfo);
          setCooldownTimer(errorData.remainingTime);
          
          toast.error(`AI insights can only be generated once every 30 minutes. Please wait ${formatTime(errorData.remainingTime)} before trying again.`, {
            duration: 5000,
          });
        } else {
          toast.error('AI insights can only be generated once every 30 minutes. Please wait before trying again.', {
            duration: 5000,
          });
        }
      } else {
        toast.error('An error occurred while generating insights.', {
          duration: 3000,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => {
          const newValue = prev - 1;
          
          if (newValue <= 0) {
            // Timer expired - clear rate limit and persisted data
            setRateLimitInfo({ isRateLimited: false, remainingTime: 0 });
            clearStorage(STORAGE_KEYS.RATE_LIMIT_STATE);
            clearStorage(STORAGE_KEYS.INSIGHTS_DATA);
            setPersistedData(null);
            
            toast.success('You can now generate a new AI insights report.', {
              duration: 3000,
            });
            
            return 0;
          }
          
          // Update rate limit info with new remaining time
          setRateLimitInfo(prev => ({ ...prev, remainingTime: newValue }));
          
          return newValue;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTimer]);

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

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      startDate: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
    }));
  };

  const exportToCSV = () => {
    if (!persistedData?.insights) return;

    const insights = persistedData.insights;
    const dataAnalyzed = persistedData.dataAnalyzed;
    const csvContent: string[] = [];
    
    // Helper function to add a section header
    const addSectionHeader = (title: string, description?: string) => {
      csvContent.push(`"**${title}**"`);
      if (description) {
        csvContent.push(`"${description}"`);
      }
      csvContent.push(''); // Empty line
    };

    // Helper function to escape CSV content
    const escapeCSV = (content: string) => {
      return `"${content.replace(/"/g, '""')}"`;
    };

    // Add report title and timestamp
    csvContent.push(`"AI Insights Report - Generated on ${new Date().toLocaleDateString()}"`);
    csvContent.push('');

    // Data Analyzed Section
    if (dataAnalyzed) {
      addSectionHeader('Data Analysis Summary');
      csvContent.push(`"Records: **${dataAnalyzed.totalRecords}**"`);
      csvContent.push(`"Workers: **${dataAnalyzed.workersAnalyzed}**"`);
      csvContent.push(`"Production Lines: **${dataAnalyzed.productionLinesAnalyzed}**"`);
      csvContent.push(`"Products: **${dataAnalyzed.productsAnalyzed}**"`);
      if (dataAnalyzed.dateRange) {
        csvContent.push(`"Date Range: ${dataAnalyzed.dateRange.startDate} to ${dataAnalyzed.dateRange.endDate}"`);
      }
      csvContent.push('');
    }

    // KPIs Section
    addSectionHeader('Key Performance Indicators');
    csvContent.push(`"**Overall Efficiency**"`);
    csvContent.push(`"**${insights.kpis.overallEfficiency.toFixed(1)}%**"`);
    csvContent.push(`"**Quality Score**"`);
    csvContent.push(`"**${insights.kpis.qualityScore.toFixed(1)}%**"`);
    csvContent.push(`"**Productivity Trend**"`);
    csvContent.push(`"**${insights.kpis.productivityTrend.charAt(0).toUpperCase() + insights.kpis.productivityTrend.slice(1)}**"`);
    csvContent.push(`"**Risk Level**"`);
    csvContent.push(`"**${insights.kpis.riskLevel.toUpperCase()}**"`);
    csvContent.push('');

    // Executive Summary Section
    addSectionHeader('Executive Summary', 'Key takeaways synthesized by AI');
    const summaryLines = insights.summary.match(/.{1,80}(?:\s|$)/g) || [insights.summary];
    summaryLines.forEach(line => {
      csvContent.push(escapeCSV(line.trim()));
    });
    csvContent.push('');

    // Critical Alerts Section
    if (insights.alerts && insights.alerts.length > 0) {
      addSectionHeader('Critical Alerts', 'Items requiring your attention');
      
      insights.alerts.forEach((alert, index) => {
        const alertType = alert.type.charAt(0).toUpperCase() + alert.type.slice(1);
        csvContent.push(`"**${alertType} Alert**"`);
        csvContent.push(escapeCSV(alert.message));
        csvContent.push(`"**Recommended Action:** ${alert.action}"`);
        if (index < insights.alerts.length - 1) {
          csvContent.push('');
        }
      });
      csvContent.push('');
    }

    // AI Recommendations Section
    if (insights.recommendations && insights.recommendations.length > 0) {
      addSectionHeader('AI Recommendations', 'Prioritized actions to improve performance');
      
      insights.recommendations.forEach((rec, index) => {
        const priority = rec.priority.toUpperCase();
        const category = rec.category.charAt(0).toUpperCase() + rec.category.slice(1);
        
        csvContent.push(`"**${priority}** **${category}**"`);
        csvContent.push(`"**${rec.title}**"`);
        csvContent.push(escapeCSV(rec.description));
        csvContent.push(`"**Expected Impact:** ${rec.impact}"`);
        
        if (index < insights.recommendations.length - 1) {
          csvContent.push('');
        }
      });
    }

    // Add footer with export info
    csvContent.push('');
    csvContent.push('');
    csvContent.push(`"Report exported on ${new Date().toLocaleString()}"`);
    csvContent.push('"Generated by AI Insights Dashboard"');

    // Create CSV content
    const csv = csvContent.join('\n');

    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-report-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('AI insights report has been downloaded as CSV file.', {
      duration: 3000,
    });
  };

  // Extract insights and dataAnalyzed from persisted data
  const insights = persistedData?.insights;
  const dataAnalyzed = persistedData?.dataAnalyzed;
  const trendDisplay = insights ? getTrendDisplay(insights.kpis.productivityTrend) : null;
  const hasValidFilters = Boolean(filters.startDate && filters.endDate);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative">
      {/* Loading overlay when generating */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg border">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium">Generating AI insights...</span>
            </div>
          </div>
        </div>
      )}

      {/* Introduction & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground">AI-driven analysis of production performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!insights}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isGenerating || rateLimitInfo.isRateLimited || !hasValidFilters}
          >
            {rateLimitInfo.isRateLimited ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Wait {formatTime(cooldownTimer)}
              </>
            ) : (
              <>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitInfo.isRateLimited && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">Rate Limit Active</h3>
                <p className="text-sm text-amber-700">
                  AI insights can only be generated once every 30 minutes. Please wait {formatTime(cooldownTimer)} before generating a new report.
                  Your current report will remain available until the timer expires. To keep these insights permanently, 
                  please use the Export button to download them as a CSV file, as AI generated reports are not saved long-term.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
       <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(new Date(filters.startDate), "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => handleDateRangeChange(date ? date.toISOString().split('T')[0] : filters.startDate, filters.endDate ?? '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(new Date(filters.endDate), "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => handleDateRangeChange(filters.startDate ?? '', date ? date.toISOString().split('T')[0] : filters.endDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {dataAnalyzed && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>Records: <span className="font-medium text-foreground">{dataAnalyzed.totalRecords}</span></div>
            <div>Workers: <span className="font-medium text-foreground">{dataAnalyzed.workersAnalyzed}</span></div>
            <div>Production Lines: <span className="font-medium text-foreground">{dataAnalyzed.productionLinesAnalyzed}</span></div>
            <div>Products: <span className="font-medium text-foreground">{dataAnalyzed.productsAnalyzed}</span></div>
          </div>
        )}
      </CardContent>
    </Card>

      {/* Show no data state or insights */}
      {!insights ? (
        <NoDataState onGenerate={handleRefresh} hasFilters={hasValidFilters} />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" /> Overall Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {insights.kpis.overallEfficiency.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {insights.kpis.qualityScore.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Productivity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${trendDisplay?.color}`}>
                  {insights.kpis.productivityTrend === 'improving' ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : insights.kpis.productivityTrend === 'declining' ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  )}
                  {trendDisplay?.label}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={`text-base px-3 py-1 ${getRiskColor(insights.kpis.riskLevel)} border`}
                  >
                    {insights.kpis.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Key takeaways synthesized by AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{insights.summary}</p>
            </CardContent>
          </Card>

          {/* Alerts */}
          {insights.alerts && insights.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Critical Alerts</CardTitle>
                <CardDescription>Items requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.alerts.map((alert) => (
                    <div key={`${alert.type}-${alert.message}`} className={`rounded-md border ${alert.type === 'critical' ? 'border-destructive/50 bg-destructive/10' : alert.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : 'border-blue-500/40 bg-blue-500/10'} p-4`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {alert.type === 'critical' ? (
                              <ShieldAlert className="h-4 w-4 text-destructive" />
                            ) : alert.type === 'warning' ? (
                              <ShieldAlert className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Info className="h-4 w-4 text-blue-600" />
                            )}
                            <h4 className="font-semibold">
                              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                            </h4>
                          </div>
                          <p className="text-sm text-foreground/90">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Recommended Action:</span> {alert.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Prioritized actions to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insights.recommendations.map((rec) => (
                  <Card key={`${rec.title}-${rec.category}-${rec.priority}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={`${getPriorityColor(rec.priority)} border`}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold leading-snug">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        <span className="font-medium text-foreground">Expected Impact:</span> {rec.impact}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AIInsightsDashboard;