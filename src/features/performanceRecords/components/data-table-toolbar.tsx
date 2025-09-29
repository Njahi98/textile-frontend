import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../../shared/data-table/data-table-view-options'
import { shifts } from '../data/data'
import { DataTableFacetedFilter } from '../../shared/data-table/data-table-faceted-filter'
import { DateRangeFilter } from './date-range-filter'
import { PerformanceRecordQueryParams } from '@/services/performance.api'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onQueryChange: (params: PerformanceRecordQueryParams) => void
  queryParams: PerformanceRecordQueryParams
}

export function DataTableToolbar<TData>({
  table,
  onQueryChange,
  queryParams,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation(['performanceRecords']);

  const isFiltered = table.getState().columnFilters.length > 0 || 
                     queryParams.startDate || queryParams.endDate || queryParams.search
  
  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      onQueryChange({ 
        ...queryParams, 
        page: 1, // Reset to first page when searching
        search: value.length >= 2 ? value : undefined 
      })
    }, 500) // 500ms debounce
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={t('searchPlaceholder')}
          defaultValue={queryParams.search ?? ''}
          onChange={(event) => handleSearchChange(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2 flex-wrap'>
          {/* Date Range Filter */}
          <DateRangeFilter 
            onQueryChange={onQueryChange}
            queryParams={queryParams}
          />
          
          {/* Shift Filter */}
          {table.getColumn('shift') && (
            <DataTableFacetedFilter
              column={table.getColumn('shift')}
              title={t('shift')}
              options={shifts}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              onQueryChange({ page: 1, limit: queryParams.limit })
            }}
            className='h-8 px-2 lg:px-3'
          >
            {t('reset')}
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}