import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Filter, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersSectionProps {
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  groupBy: string;
  setGroupBy: (group: string) => void;
  workerId: string;
  setWorkerId: (id: string) => void;
  productionLineId: string;
  setProductionLineId: (id: string) => void;
  onFilter: () => void;
  loading: boolean;
  t: (k: string) => string;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  dateRange, setDateRange, groupBy, setGroupBy, workerId, setWorkerId, productionLineId, setProductionLineId,t
}) => {
  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t('filters.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Label className="text-sm">{t('filters.dateRange')}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm", !dateRange.from && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" /> <span className="truncate">{dateRange.from ? dateRange.from.toLocaleDateString() : t('filters.startDate')}</span> </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateRange.from} onSelect={date => setDateRange({ ...dateRange, from: date || dateRange.from })} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm", !dateRange.to && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" /> <span className="truncate">{dateRange.to ? dateRange.to.toLocaleDateString() : t('filters.endDate')}</span> </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateRange.to} onSelect={date => setDateRange({ ...dateRange, to: date || dateRange.to })} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm">{t('filters.groupBy')}</Label>
          <Select value={groupBy} onValueChange={v => setGroupBy(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t('filters.groupByOptions.date')}</SelectItem>
              <SelectItem value="worker">{t('filters.groupByOptions.worker')}</SelectItem>
              <SelectItem value="product">{t('filters.groupByOptions.product')}</SelectItem>
              <SelectItem value="productionLine">{t('filters.groupByOptions.productionLine')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">{t('filters.workerIdOptional')}</Label>
            <input type="text" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder={t('filters.enterWorkerId')} value={workerId} onChange={e => setWorkerId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">{t('filters.productionLineIdOptional')}</Label>
            <input type="text" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder={t('filters.enterLineId')} value={productionLineId} onChange={e => setProductionLineId(e.target.value)} />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default FiltersSection;
