import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAssignments } from '../context/assignments-context'
import { AssignmentsMutateDrawer } from './assignments-mutate-drawer'
import { assignmentApi } from '@/services/assignment.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function AssignmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAssignments()
  const { t } = useTranslation(['assignment']);
  

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await assignmentApi.deleteAssignment(currentRow.id)
      if (response.success) {
        toast.success(response.message || t('messages.deleteSuccess'))
      } else {
        toast.error(response.message || t('messages.deleteError'))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.deleteUnknownError'))
    } finally {
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    }
  }

  return (
    <>
      <AssignmentsMutateDrawer
        key='assignment-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <AssignmentsMutateDrawer
            key={`assignment-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='assignment-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => void handleDelete()}
            className='max-w-md'
            title={t('dialogs.delete.title', { id: currentRow.id })}
            desc={
              <>
                {t('dialogs.delete.description', { 
                  id: currentRow.id,
                  workerName: currentRow.worker.name,
                  productionLineName: currentRow.productionLine.name
                })}
              </>
            }
            confirmText={t('dialogs.delete.confirmButton')}
          />
        </>
      )}
    </>
  )
}
