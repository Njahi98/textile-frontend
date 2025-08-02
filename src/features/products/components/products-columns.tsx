import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { Product } from '@/services/product.api'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Image as ImageIcon } from 'lucide-react'

export const columns: ColumnDef<Product>[] = [
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
    id: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product Image' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center justify-center">
          {product.imageUrl ? (
            <div className="relative group">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Hover overlay with product name */}
              <div className="absolute inset-0 bg-black/60 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-center p-1">
                {product.name}
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <div className="text-xs text-muted-foreground font-medium">
                  {product.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('code')}</div>
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
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('category') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'unitPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit Price' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('unitPrice') ? `$${row.getValue('unitPrice')}` : '-'}</div>
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]
