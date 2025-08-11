import { X } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DataTableViewOptions } from './data-table-view-options'
import { shifts } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      table.getColumn('date')?.setFilterValue(dateString)
    } else {
      table.getColumn('date')?.setFilterValue('')
    }
  }

  const clearDateFilter = () => {
    setSelectedDate(undefined)
    table.getColumn('date')?.setFilterValue('')
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter by Worker name...'
          value={(table.getColumn('workerName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('workerName')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <Input
          placeholder='Filter by Product name...'
          value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('productName')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <Input
          placeholder='Filter by Production Line...'
          value={(table.getColumn('productionLineName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('productionLineName')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('shift') && (
            <DataTableFacetedFilter
              column={table.getColumn('shift')}
              title='Shift'
              options={shifts}
            />
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-8 justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Filter by date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date('1900-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilter}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              setSelectedDate(undefined)
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
