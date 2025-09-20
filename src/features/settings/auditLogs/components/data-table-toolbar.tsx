import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DateRangeFilter } from './date-range-filter'
import { AuditLog } from '../data/schema'
import { AuditLogQueryParams } from '@/services/auditLog.api'
import { useEffect, useRef } from 'react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onQueryChange: (params: AuditLogQueryParams) => void
  queryParams: AuditLogQueryParams
}

export function DataTableToolbar<TData>({
  table,
  onQueryChange,
  queryParams,
}: DataTableToolbarProps<TData>) {
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

  // Generate action options
  const getActionOptions = () => {
    const auditLogs = table.getCoreRowModel().rows.map(row => row.original) as AuditLog[]
    const uniqueActions = [...new Set(auditLogs.map(log => log.action))]
    
    return uniqueActions.map(action => ({
      label: action,
      value: action,
    }))
  }

  // Generate resource options
  const getResourceOptions = () => {
    const auditLogs = table.getCoreRowModel().rows.map(row => row.original) as AuditLog[]
    const uniqueResources = [...new Set(auditLogs.map(log => log.resource))]
    
    return uniqueResources.map(resource => ({
      label: resource.replace('_', ' '),
      value: resource,
    }))
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search by username or description...'
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
          
          {/* Action Filter */}
          {table.getColumn('action') && (
            <DataTableFacetedFilter
              column={table.getColumn('action')}
              title='Action'
              options={getActionOptions()}
            />
          )}
          
          {/* Resource Filter */}
          {table.getColumn('resource') && (
            <DataTableFacetedFilter
              column={table.getColumn('resource')}
              title='Resource'
              options={getResourceOptions()}
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
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}