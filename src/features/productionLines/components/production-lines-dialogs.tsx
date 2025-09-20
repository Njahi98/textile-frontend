import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProductionLines } from '../context/production-lines-context'
import { ProductionLinesMutateDrawer } from './production-lines-mutate-drawer'
import { productionLineApi } from '@/services/productionLine.api'
import { toast } from 'sonner'

export function ProductionLinesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProductionLines()

  const handleDelete = async () => {
              try {
                if (currentRow) {
                  const response = await productionLineApi.delete(currentRow.id)
                  if (response.success) {
                    toast.success(response.message)
                  } else {
                    toast.error(response.message || 'Failed to delete production line')
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  toast.error(error.message)
                } else {
                  toast.error('Something went wrong')
                }
              } finally {
                setOpen(null)
              }
            }


  return (
    <>
      <ProductionLinesMutateDrawer
        key='production-line-create'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ProductionLinesMutateDrawer
            key={`production-line-update-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='production-line-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={()=> void handleDelete()}
            className='max-w-md'
            title={`Delete this production line: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a production line with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
