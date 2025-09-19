import { useAuditLogs } from '../context/audit-logs-context'
import { AuditLogViewDialog } from './audit-log-view-dialog'
import { AuditLogCleanupDialog } from './audit-log-cleanup-dialog'

export function AuditLogsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAuditLogs()
  return (
    <>
      {currentRow && (
        <AuditLogViewDialog
          key={`audit-log-view-${currentRow.id}`}
          open={open === 'view'}
          onOpenChange={() => {
            setOpen('view')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
      
      <AuditLogCleanupDialog
        key='audit-log-cleanup'
        open={open === 'cleanup'}
        onOpenChange={() => setOpen('cleanup')}
      />
    </>
  )
}