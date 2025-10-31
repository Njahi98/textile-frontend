import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PerformanceAnalytics } from '@/services/performance.api';

interface EmptyStateCardProps {
  groupBy: string;
  analytics: PerformanceAnalytics;
  t: (k: string) => string;
  onRetry: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ groupBy, analytics, t, onRetry }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
      <Activity className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
      <h3 className="text-base md:text-lg font-semibold mb-2">{t('emptyState.title')}</h3>
      <div className="text-sm text-muted-foreground space-y-1 mb-4">
        <p>{t('emptyState.noRecords')}</p>
        <p className="text-xs">
          {t('emptyState.group')}: <span className="font-medium">{groupBy}</span> •  {t('emptyState.rawItems')}: <span className="font-medium">{analytics?.grouped?.length || 0}</span>
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        {t('buttons.tryAgain')}
      </Button>
    </CardContent>
  </Card>
);

export default EmptyStateCard;
