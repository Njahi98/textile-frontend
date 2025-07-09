import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { ProductionLine } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<ProductionLine>[] = [
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
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('description') ?? '-'}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Capacity' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('capacity') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('isActive') ? 'Active' : 'Inactive'}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'targetOutput',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Target Output' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('targetOutput') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('location') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'currentAssignments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Current Assignments' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('currentAssignments')}</div>
    ),
  },
  {
    accessorKey: 'dailyOutput',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Daily Output' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('dailyOutput')}</div>
    ),
  },
  {
    id: 'avgErrorRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Avg Error Rate' />
    ),
    cell: ({ row }) => (
      <div>{row.original.performance?.avgErrorRate ?? '-'}</div>
    ),
  },
  {
    id: 'avgTimeTaken',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Avg Time Taken' />
    ),
    cell: ({ row }) => (
      <div>{row.original.performance?.avgTimeTaken ?? '-'}</div>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
