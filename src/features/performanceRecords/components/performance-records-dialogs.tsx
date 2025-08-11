import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePerformanceRecords } from '../context/performance-records-context'
import { PerformanceRecordsMutateDrawer } from './performance-records-mutate-drawer'
import { performanceApi } from '@/services/performance.api'
import { toast } from 'sonner'

export function PerformanceRecordsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePerformanceRecords()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await performanceApi.deletePerformanceRecord(currentRow.id)
      if (response.success) {
        toast.success('Performance record deleted successfully')
      } else {
        toast.error(response.message || 'Failed to delete performance record')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the performance record')
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
            currentRow={currentRow}
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
            title={`Delete this performance record: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a performance record with the ID{' '}
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
