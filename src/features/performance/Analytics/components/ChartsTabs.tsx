import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, Legend, ScatterChart, Scatter } from 'recharts';

interface ChartsTabsProps {
  chartData: any[];
  groupBy: string;
  t: (k: string, options?: Record<string, any>) => string;
}

const ChartsTabs: React.FC<ChartsTabsProps> = ({ chartData, groupBy, t }) => (
  <Tabs defaultValue="production" className="space-y-3 md:space-y-4">
    <div className="overflow-x-auto">
      <TabsList className="grid w-full grid-cols-4 min-w-[320px]">
        <TabsTrigger value="production" className="text-xs md:text-sm px-2">{t('tabs.production')}</TabsTrigger>
        <TabsTrigger value="quality" className="text-xs md:text-sm px-2">{t('tabs.quality')}</TabsTrigger>
        <TabsTrigger value="efficiency" className="text-xs md:text-sm px-2">{t('tabs.efficiency')}</TabsTrigger>
        <TabsTrigger value="comparison" className="text-xs md:text-sm px-2">{t('tabs.compare')}</TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="production" className="space-y-4 mt-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">{t('charts.productionTrends.title')}</CardTitle>
          <CardDescription className="text-sm">
            {groupBy === 'date' ? t('charts.productionTrends.dailyOutput') : t('charts.productionTrends.productionBy', { groupBy })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {groupBy === 'date' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPieces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="pieces" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPieces)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 9 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="pieces" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="quality" className="space-y-4 mt-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">{t('charts.errorRateAnalysis.title')}</CardTitle>
          <CardDescription className="text-sm">{t('charts.errorRateAnalysis.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={groupBy === 'date' ? 'date' : 'name'} className="text-xs" tick={{ fontSize: 10 }} angle={groupBy !== 'date' ? -45 : 0} textAnchor={groupBy !== 'date' ? 'end' : 'middle'} height={groupBy !== 'date' ? 80 : 60} />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} name="Error Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="efficiency" className="space-y-4 mt-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">{t('charts.timeEfficiency.title')}</CardTitle>
          <CardDescription className="text-sm">{t('charts.timeEfficiency.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={groupBy === 'date' ? 'date' : 'name'} className="text-xs" tick={{ fontSize: 10 }} angle={groupBy !== 'date' ? -45 : 0} textAnchor={groupBy !== 'date' ? 'end' : 'middle'} height={groupBy !== 'date' ? 80 : 60} />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '11px' }} />
                <Bar dataKey="timeTaken" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="comparison" className="space-y-4 mt-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">{t('charts.performanceComparison.title')}</CardTitle>
          <CardDescription className="text-sm">{t('charts.performanceComparison.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="pieces" name="Pieces" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis dataKey="errorRate" name="Error Rate" className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '11px' }} />
                <Scatter name="Performance" data={chartData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

export default ChartsTabs;