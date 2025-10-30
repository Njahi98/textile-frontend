import { useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AuditLogQueryParams } from '@/services/auditLog.api'
import { useTranslation } from 'react-i18next'

interface DateRangeFilterProps {
  onQueryChange: (params: AuditLogQueryParams) => void
  queryParams: AuditLogQueryParams
}

export function DateRangeFilter({ onQueryChange, queryParams }: DateRangeFilterProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const { t } = useTranslation(['auditLogs']);


  const handleStartDateSelect = (date: Date | undefined) => {
    const startDate = date ? format(date, 'yyyy-MM-dd') : undefined
    onQueryChange({ 
      ...queryParams, 
      page: 1, // Reset to first page when filtering
      startDate 
    })
    setStartDateOpen(false)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    const endDate = date ? format(date, 'yyyy-MM-dd') : undefined
    onQueryChange({ 
      ...queryParams, 
      page: 1, // Reset to first page when filtering
      endDate 
    })
    setEndDateOpen(false)
  }

  const clearDateFilters = () => {
    onQueryChange({
      ...queryParams,
      page: 1,
      startDate: undefined,
      endDate: undefined,
    })
  }

  const hasDateFilters = queryParams.startDate ?? queryParams.endDate

  return (
    <div className="flex items-center gap-2">
      
      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 justify-start text-left font-normal border-dashed',
              !queryParams.startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {queryParams.startDate ? format(new Date(queryParams.startDate), 'MMM dd, yyyy') : t('startDate')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={queryParams.startDate ? new Date(queryParams.startDate) : undefined}
            onSelect={handleStartDateSelect}
            disabled={(date) => {
              // Disable future dates and dates after end date if set
              if (date > new Date()) return true
              if (queryParams.endDate && date > new Date(queryParams.endDate)) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      
      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 justify-start text-left font-normal border-dashed',
              !queryParams.endDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {queryParams.endDate ? format(new Date(queryParams.endDate), 'MMM dd, yyyy') : t('endDate')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={queryParams.endDate ? new Date(queryParams.endDate) : undefined}
            onSelect={handleEndDateSelect}
            disabled={(date) => {
              // Disable future dates and dates before start date if set
              if (date > new Date()) return true
              if (queryParams.startDate && date < new Date(queryParams.startDate)) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      
      {hasDateFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDateFilters}
          className="h-8 px-2"
        >
          {t('clearDates')}
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  )
}