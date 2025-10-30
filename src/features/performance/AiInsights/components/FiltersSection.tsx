import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { InsightsFilters } from '@/services/insights.api';

interface FiltersSectionProps {
  filters: InsightsFilters;
  onChangeDateRange: (startDate: string, endDate: string) => void;
  dataAnalyzed?: { totalRecords: number; workersAnalyzed: number; productionLinesAnalyzed: number; productsAnalyzed: number } | null;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ filters, onChangeDateRange, dataAnalyzed }) => {
  const { t } = useTranslation(['aiInsights']);
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">{t('startDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="startDate" variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(new Date(filters.startDate), 'PPP') : t('pickStartDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => onChangeDateRange(date ? date.toISOString().split('T')[0] : filters.startDate ?? '', filters.endDate ?? '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">{t('endDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="endDate" variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(new Date(filters.endDate), 'PPP') : t('pickEndDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => onChangeDateRange(filters.startDate ?? '', date ? date.toISOString().split('T')[0] : filters.endDate ?? '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {dataAnalyzed && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>{t('records')}: <span className="font-medium text-foreground">{dataAnalyzed.totalRecords}</span></div>
            <div>{t('workers')}: <span className="font-medium text-foreground">{dataAnalyzed.workersAnalyzed}</span></div>
            <div>{t('productionLines')}: <span className="font-medium text-foreground">{dataAnalyzed.productionLinesAnalyzed}</span></div>
            <div>{t('products')}: <span className="font-medium text-foreground">{dataAnalyzed.productsAnalyzed}</span></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltersSection;
