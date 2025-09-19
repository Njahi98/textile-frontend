import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { AuditLog } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'

export const columns: ColumnDef<AuditLog>[] = [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap font-mono text-sm'>
        #{row.getValue('id')}
      </div>
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
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      const getActionColor = (action: string) => {
        switch (action) {
          case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
          case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          case 'VIEW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          case 'LOGIN': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
          case 'LOGOUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
      }
      return (
        <Badge className={getActionColor(action)}>
          {action}
        </Badge>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'resource',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Resource' />
    ),
    cell: ({ row }) => {
      const resource = row.getValue('resource') as string
      return (
        <div className='w-fit text-nowrap'>
          {resource.replace('_', ' ')}
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'user.username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const auditLog = row.original
      const user = auditLog.user
      if (!user) return <div className='text-muted-foreground'>System</div>
      
      return (
        <div className='w-fit text-nowrap'>
          <div className='font-medium'>{user.username}</div>
          <div className='text-xs text-muted-foreground'>{user.email}</div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return (
        <LongText className='max-w-48'>
          {description ?? '-'}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'resourceId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Resource ID' />
    ),
    cell: ({ row }) => {
      const resourceId = row.getValue('resourceId') as string | null
      return (
        <div className='w-fit text-nowrap font-mono text-sm'>
          {resourceId ?? '-'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IP Address' />
    ),
    cell: ({ row }) => {
      const ipAddress = row.getValue('ipAddress') as string | null
      return (
        <div className='w-fit text-nowrap font-mono text-sm'>
          {ipAddress ?? '-'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Timestamp' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt')
      return (
        <div className='w-fit text-nowrap'>
          <div className='text-sm'>
            {date ? new Date(date as string).toLocaleDateString() : '-'}
          </div>
          <div className='text-xs text-muted-foreground'>
            {date ? new Date(date as string).toLocaleTimeString() : '-'}
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
