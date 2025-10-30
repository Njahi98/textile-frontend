import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { auditLogApi } from '@/services/auditLog.api'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { useTranslation } from 'react-i18next'

interface AuditLogCleanupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogCleanupDialog({ open, onOpenChange }: AuditLogCleanupDialogProps) {
  const [days, setDays] = useState<string>('365')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation(['auditLogs']);

  const handleCleanup = async () => {
    const daysNumber = parseInt(days)
    
    if (isNaN(daysNumber) || daysNumber < 30) {
      toast.error(t('validDaysError'))
      return
    }

    setIsLoading(true)
    try {
      const result = await auditLogApi.cleanupAuditLogs(daysNumber)
      if(result.success){
        toast.success(result.message || 'Audit logs cleaned up successfully')
        await mutate('/api/audit-logs')
      }
      onOpenChange(false)
      setDays('365')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('cleanupFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cleanupTitle')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('cleanupWarning')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="days">{t('keepLogsFor')}</Label>
            <Input
              id="days"
              type="number"
              min="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="365"
            />
            <p className="text-xs text-muted-foreground">
              {t('minimumDaysNote')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isLoading}
          >
              {isLoading ? t('cleaningUp') : t('cleanup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
