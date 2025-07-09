import { Ellipsis } from 'lucide-react'
import { Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'  
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProductionLines } from '../context/production-lines-context'
import { ProductionLine, productionLineSchema,  } from '../data/schema'
import { productionLineApi } from '@/services/productionLine.api'
import { toast } from 'sonner'

interface DataTableRowActionsProps {
  row: Row<ProductionLine>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useProductionLines()
  const productionLine = productionLineSchema.parse(row.original)

  const labels = [
  {
    value: 'true',
    label: 'Active',
  },
  {
    value: 'false',
    label: 'Inactive',
  },
]



  const handleToggleStatus = async () => {
    try {
      await productionLineApi.toggleStatus(productionLine.id)
        toast.success('Production line updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle production line status')
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <Ellipsis className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <SquarePen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={productionLine.isActive ? 'true' : 'false'}
                onValueChange={(val) => {
                  // allow toggling if the value is different
                  if (val !== (productionLine.isActive ? 'true' : 'false')) {
                    void handleToggleStatus();
                  }
                }}
              >
                {labels.map((label) => (
                  <DropdownMenuRadioItem
                    key={label.value}
                    value={label.value}
                    disabled={label.value === (productionLine.isActive ? 'true' : 'false')}
                  >
                    {label.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
