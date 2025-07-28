import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAssignments } from '../context/assignments-context'
import { AssignmentsMutateDrawer } from './assignments-mutate-drawer'
import { assignmentApi } from '@/services/assignment.api'
import { toast } from 'sonner'

export function AssignmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAssignments()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await assignmentApi.deleteAssignment(currentRow.id)
      if (response.success) {
        toast.success('Assignment deleted successfully')
      } else {
        toast.error(response.message || 'Failed to delete assignment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the assignment')
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
            title={`Delete this assignment: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete an assignment with the ID{' '}
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
