import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PerformanceRecordQueryParams } from '@/services/performance.api'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  onQueryChange: (params: PerformanceRecordQueryParams) => void
  queryParams: PerformanceRecordQueryParams
}

export function DataTablePagination<TData>({
  table,
  pagination,
  onQueryChange,
  queryParams,
}: DataTablePaginationProps<TData>) {
  const handlePageChange = (page: number) => {
    onQueryChange({ ...queryParams, page })
  }

  const handlePageSizeChange = (limit: number) => {
    onQueryChange({ ...queryParams, page: 1, limit })
  }

  return (
    <div
      className='flex items-center justify-between overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {pagination.totalCount} row(s) selected.
      </div>
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select
            value={`${queryParams.limit ?? 50}`}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={queryParams.limit ?? 50} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrev}
          >
            <span className='sr-only'>Go to first page</span>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNext}
          >
            <span className='sr-only'>Go to last page</span>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
