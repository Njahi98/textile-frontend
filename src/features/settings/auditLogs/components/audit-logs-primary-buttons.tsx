import { Button } from '@/components/ui/button'
import { useAuditLogs } from '../context/audit-logs-context'
import { Download, Trash2 } from 'lucide-react'
import { auditLogApi } from '@/services/auditLog.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function AuditLogsPrimaryButtons() {
  const { setOpen } = useAuditLogs()
  const { t } = useTranslation(['auditLogs']);

  const handleExport = () => {
    auditLogApi.downloadAuditLogsCSV()
      .then(() => {
        toast.success(t('exportSuccess'))
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t('exportFailed'))
      })
  }

  return (
    <div className='flex gap-2'>
      <Button 
        variant="outline" 
        className='space-x-1' 
        onClick={handleExport}
      >
          <span>{t('exportCSV')}</span> <Download size={18} />
      </Button>
      <Button 
        variant="destructive" 
        className='space-x-1' 
        onClick={() => setOpen('cleanup')}
      >
          <span>{t('cleanup')}</span> <Trash2 size={18} />
      </Button>
    </div>
  )
}
