import { useWorkers } from '../context/workers-context'
import { WorkersActionDialog } from './workers-action-dialog'
import { WorkersDeleteDialog } from './workers-delete-dialog'

export function WorkersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useWorkers()
  return (
    <>
      <WorkersActionDialog
        key='worker-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
      {currentRow && (
        <>
          <WorkersActionDialog
            key={`worker-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WorkersDeleteDialog
            key={`worker-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
