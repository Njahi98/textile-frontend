import { useWorkers } from '../context/workers-context'
import { WorkersImportDialog } from './workers-import-dialog'
import { WorkersActionDialog } from './workers-action-dialog'
import { WorkersDeleteDialog } from './workers-delete-dialog'

export function WorkersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useWorkers()
  return (
    <>
      <WorkersImportDialog
        key='workers-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />
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