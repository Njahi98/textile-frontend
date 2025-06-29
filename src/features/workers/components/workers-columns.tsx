import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { Worker } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Worker>[] = [
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
      <DataTableColumnHeader column={column} title='name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'cin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cin' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('cin')}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      return <div>{phone ?? '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | null
      return <div className='w-fit text-nowrap'>{email ?? '-'}</div>
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null
      return <div className='w-fit text-nowrap'>{role ?? '-'}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: '_count.assignments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assignments' />
    ),
    cell: ({ row }) => {
      const worker = row.original
      const assignmentsCount = worker._count?.assignments ?? 0
      return (
        <div className='w-fit text-nowrap text-center'>
          {assignmentsCount}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: '_count.performanceRecords',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Performance Records' />
    ),
    cell: ({ row }) => {
      const worker = row.original
      const performanceCount = worker._count?.performanceRecords ?? 0
      return (
        <div className='w-fit text-nowrap text-center'>
          {performanceCount}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registered' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt')
      return (
        <div className='w-fit text-nowrap'>
          {date ? new Date(date as string).toLocaleDateString() : '-'}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
