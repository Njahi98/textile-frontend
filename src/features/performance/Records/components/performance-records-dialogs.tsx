import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePerformanceRecords } from '../context/performance-records-context'
import { PerformanceRecordsMutateDrawer } from './performance-records-mutate-drawer'
import { performanceApi, PerformanceRecord } from '@/services/performance.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function PerformanceRecordsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePerformanceRecords()
  const { t } = useTranslation(['performanceRecords']);
  

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await performanceApi.deletePerformanceRecord(currentRow.id)
      if (response.success) {
        toast.success(response.message || t('recordDeletedSuccess'))
      } else {
        toast.error(response.message || t('failedToDeleteRecord'))
      }
    } catch (error) {
        toast.error(error instanceof Error ? error.message : t('errorDeletingRecord'))
    } finally {
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    }
  }

  return (
    <>
      <PerformanceRecordsMutateDrawer
        key='performance-record-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <PerformanceRecordsMutateDrawer
            key={`performance-record-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow as PerformanceRecord}
          />

          <ConfirmDialog
            key='performance-record-delete'
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
            title={t('deleteRecordTitle', { id: currentRow.id })}
            desc={
              <>
            {t('deleteRecordDescription')} {' '}
            <strong>{currentRow.id}</strong>. <br />
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
