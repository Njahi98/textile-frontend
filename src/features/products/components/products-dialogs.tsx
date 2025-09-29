import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProducts } from '../context/products-context'
import { ProductsMutateDrawer } from './products-mutate-drawer'
import { productApi } from '@/services/product.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()
  const { t } = useTranslation(['products']);
  

  const handleDelete = async () => {
              try {
                if (currentRow) {
                  const response = await productApi.delete(currentRow.id)
                  if (response.success) {
                    toast.success(response.message)
                  } else {
                    toast.error(response.message || t('failedToDeleteProduct'))
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  toast.error(error.message)
                } else {
                  toast.error(t('somethingWentWrong'))
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
            title={t('deleteProductTitle', { name: currentRow.name })}
            desc={
              <>
                {t('deleteProductDescription')} {' '}
                <strong>{currentRow.name}</strong>. <br />
                {t('actionCannotBeUndone')}
              </>
            }
            confirmText={t('delete')}
          />
        </>
      )}
    </>
  )
}
