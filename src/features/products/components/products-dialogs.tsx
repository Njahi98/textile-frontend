import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProducts } from '../context/products-context'
import { ProductsMutateDrawer } from './products-mutate-drawer'
import { productApi } from '@/services/product.api'
import { toast } from 'sonner'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()

  const handleDelete = async () => {
              try {
                if (currentRow) {
                  const response = await productApi.delete(currentRow.id)
                  if (response.success) {
                    toast.success(response.message)
                  } else {
                    toast.error(response.message || 'Failed to delete product')
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
      <ProductsMutateDrawer
        key='product-create'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />


      {currentRow && (
        <>
          <ProductsMutateDrawer
            key={`product-update-${currentRow.id}`}
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
            key='product-delete'
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
            title={`Delete this product: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a product with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
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
