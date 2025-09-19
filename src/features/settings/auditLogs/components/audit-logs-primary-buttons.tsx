import { Button } from '@/components/ui/button'
import { useAuditLogs } from '../context/audit-logs-context'
import { Download, Trash2 } from 'lucide-react'
import { auditLogApi } from '@/services/auditLog.api'
import { toast } from 'sonner'

export function AuditLogsPrimaryButtons() {
  const { setOpen } = useAuditLogs()

  const handleExport = () => {
    auditLogApi.downloadAuditLogsCSV()
      .then(() => {
        toast.success('Audit logs exported successfully')
      })
      .catch((error) => {
        toast.error('Failed to export audit logs')
        console.error('Export error:', error)
      })
  }

  return (
    <div className='flex gap-2'>
      <Button 
        variant="outline" 
        className='space-x-1' 
        onClick={handleExport}
      >
        <span>Export CSV</span> <Download size={18} />
      </Button>
      <Button 
        variant="destructive" 
        className='space-x-1' 
        onClick={() => setOpen('cleanup')}
      >
        <span>Cleanup</span> <Trash2 size={18} />
      </Button>
    </div>
  )
}
