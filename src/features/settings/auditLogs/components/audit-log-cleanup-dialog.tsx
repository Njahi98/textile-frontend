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

interface AuditLogCleanupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogCleanupDialog({ open, onOpenChange }: AuditLogCleanupDialogProps) {
  const [days, setDays] = useState<string>('365')
  const [isLoading, setIsLoading] = useState(false)

  const handleCleanup = async () => {
    const daysNumber = parseInt(days)
    
    if (isNaN(daysNumber) || daysNumber < 30) {
      toast.error('Please enter a valid number of days (minimum 30)')
      return
    }

    setIsLoading(true)
    try {
      const result = await auditLogApi.cleanupAuditLogs(daysNumber)
      toast.success(result.message)
      
      await mutate('/api/audit-logs')
      
      onOpenChange(false)
      setDays('365')
    } catch (error) {
      toast.error('Failed to cleanup audit logs')
      console.error('Cleanup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cleanup Audit Logs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will permanently delete audit log records older than the specified number of days. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="days">Keep logs for (days)</Label>
            <Input
              id="days"
              type="number"
              min="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="365"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 30 days. Records older than this will be deleted.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isLoading}
          >
            {isLoading ? 'Cleaning up...' : 'Cleanup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
