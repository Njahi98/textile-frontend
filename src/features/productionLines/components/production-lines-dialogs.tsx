import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProductionLines } from '../context/production-lines-context'
import { ProductionLinesMutateDrawer } from './production-lines-mutate-drawer'
import { productionLineApi } from '@/services/productionLine.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function ProductionLinesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProductionLines()
  const { t } = useTranslation(['productionLines']);

  const handleDelete = async () => {
              try {
                if (currentRow) {
                  const response = await productionLineApi.delete(currentRow.id)
                  if (response.success) {
                    toast.success(response.message)
                  } else {
                    toast.error(response.message || t('messages.deleteError'))
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  toast.error(error.message)
                } else {
                  toast.error(t('messages.somethingWentWrong'))
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
            title={t('dialogs.delete.title', { id: currentRow.id })}
            desc={
              <>
                {t('dialogs.delete.description', { id: currentRow.id })}
              </>
            }
            confirmText={t('dialogs.delete.confirmButton')}
          />
        </>
      )}
    </>
  )
}
