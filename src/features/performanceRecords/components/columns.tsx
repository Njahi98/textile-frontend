import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { shifts } from '../data/data'
import { PerformanceRecord } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const columns: ColumnDef<PerformanceRecord>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'workerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Worker' />
    ),
    accessorFn: row => row.worker?.name,
    cell: ({ row }) => {
      const worker = row.original.worker
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{worker.name}</span>
          <span className='text-sm text-muted-foreground'>CIN: {worker.cin}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    accessorFn: row => row.product?.name,
    cell: ({ row }) => {
      const product = row.original.product
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{product.name}</span>
          <span className='text-sm text-muted-foreground'>Code: {product.code}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'productionLineName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Production Line' />
    ),
    accessorFn: row => row.productionLine?.name,
    cell: ({ row }) => {
      const productionLine = row.original.productionLine
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{productionLine.name}</span>
          <span className='text-sm text-muted-foreground'>{productionLine.location}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'piecesMade',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pieces Made' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span className='font-medium'>{row.getValue('piecesMade')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'timeTaken',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time Taken (hrs)' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span>{Number(row.getValue('timeTaken')).toFixed(2)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'errorRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Error Rate (%)' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span className={Number(row.getValue('errorRate')) > 5 ? 'text-red-600 font-medium' : ''}>
          {Number(row.getValue('errorRate')).toFixed(2)}%
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'shift',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shift' />
    ),
    cell: ({ row }) => {
      const shift = shifts.find(
        (shift) => shift.value === row.getValue('shift')
      );
      return (
        <div className='flex items-center'>
          {shift?.icon && (
            <shift.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{shift?.label ?? row.getValue('shift')}</span>
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = String(row.getValue('date'));
      return (
        <div className='flex items-center'>
          <span>{format(new Date(date), 'MMM dd, yyyy')}</span>
        </div>
      );
    },
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const rowDate = row.getValue(id);
      // rowDate may be a Date object or a string, so normalize it
      const formattedRowDate = rowDate instanceof Date ? format(rowDate, 'yyyy-MM-dd') : format(new Date(String(rowDate)), 'yyyy-MM-dd');
      return formattedRowDate === value;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
