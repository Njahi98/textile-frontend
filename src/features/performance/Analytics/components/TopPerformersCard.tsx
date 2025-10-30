import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartDataItem, getErrorRateBadge, getDisplayName } from '../data/chartData';

interface TopPerformersCardProps {
  topPerformers: ChartDataItem[];
  groupBy: string;
  t: (key: string, options?: Record<string, any>) => string;
}

const TopPerformersCard: React.FC<TopPerformersCardProps> = ({ topPerformers, groupBy, t }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base md:text-lg">{t('topPerformers.title')}</CardTitle>
      <CardDescription className="text-sm">
        {t('topPerformers.description')} {groupBy !== 'date' && t('topPerformers.by', { groupBy })}
      </CardDescription>
    </CardHeader>
    <CardContent className="p-3 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {topPerformers.map((performer, index) => (
          <div key={performer.id || index} className="flex items-start gap-3">
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md bg-primary/10 flex-shrink-0 mt-0.5">
              <span className="text-xs md:text-sm font-semibold">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm md:text-base font-medium leading-tight truncate">{getDisplayName(performer)}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                    <span className="font-medium">{performer.pieces.toLocaleString()} pieces</span>
                    {performer.code && (<><span className="hidden sm:inline">•</span><span>Code: {performer.code}</span></>)}
                    {performer.location && (<><span className="hidden sm:inline">•</span><span className="truncate">{performer.location}</span></>)}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 text-right flex-shrink-0">
                  <Badge {...getErrorRateBadge(t, performer.errorRate)} className="text-xs">
                    {performer.errorRate.toFixed(1)}% error
                  </Badge>
                  <p className="text-xs text-muted-foreground">{performer.timeTaken.toFixed(1)}h avg</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default TopPerformersCard;