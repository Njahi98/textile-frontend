import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuditLog } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface AuditLogViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AuditLog
}

export function AuditLogViewDialog({ open, onOpenChange, currentRow }: AuditLogViewDialogProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'VIEW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'LOGIN': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      case 'LOGOUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Helper function to safely display JSON data
  const JsonDisplay = ({ data, title }: { data: any, title: string }) => {
    if (!data) return null;
    
    const jsonString = JSON.stringify(data, null, 2);
    
    return (
      <>
        <Separator />
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">{title}</h4>
          <div className="bg-muted/50 p-3 rounded-md overflow-hidden">
            <ScrollArea className="max-h-40 w-full">
              <pre className="text-xs whitespace-pre-wrap break-all font-mono">
                {jsonString}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>Audit Log Details</span>
            <Badge className={getActionColor(currentRow.action)}>
              {currentRow.action}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4 w-full">
          <div className="space-y-6 overflow-hidden">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">ID</h4>
                <p className="font-mono text-sm break-all">#{currentRow.id}</p>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Timestamp</h4>
                <p className="text-sm break-all">
                  {new Date(currentRow.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Resource</h4>
                <p className="text-sm break-all">{currentRow.resource.replace('_', ' ')}</p>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Resource ID</h4>
                <p className="font-mono text-sm break-all">{currentRow.resourceId ?? 'N/A'}</p>
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div className="min-w-0">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">User</h4>
              {currentRow.user ? (
                <div className="bg-muted/50 p-3 rounded-md overflow-hidden">
                  <p className="font-medium break-all">{currentRow.user.username}</p>
                  <p className="text-sm text-muted-foreground break-all">{currentRow.user.email}</p>
                  <p className="text-sm text-muted-foreground">Role: {currentRow.user.role}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">System</p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div className="min-w-0">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-sm break-words">{currentRow.description ?? 'No description available'}</p>
            </div>

            <Separator />

            {/* Technical Details */}
            <div className="grid grid-cols-1 gap-4">
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">IP Address</h4>
                <p className="font-mono text-sm break-all">{currentRow.ipAddress ?? 'N/A'}</p>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">User Agent</h4>
                <div className="bg-muted/50 p-3 rounded-md overflow-hidden">
                  <ScrollArea className="max-h-20 w-full">
                    <p className="text-sm break-all whitespace-pre-wrap">
                      {currentRow.userAgent ?? 'N/A'}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Old Values */}
            <JsonDisplay data={currentRow.oldValues} title="Previous Values" />

            {/* New Values */}
            <JsonDisplay data={currentRow.newValues} title="New Values" />

            {/* Metadata */}
            <JsonDisplay data={currentRow.metadata} title="Metadata" />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}