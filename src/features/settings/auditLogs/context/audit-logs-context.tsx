import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { AuditLog } from '../data/schema'

type AuditLogsDialogType = 'view' | 'export' | 'cleanup'

interface AuditLogsContextType {
  open: AuditLogsDialogType | null
  setOpen: (str: AuditLogsDialogType | null) => void
  currentRow: AuditLog | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AuditLog | null>>
}

const AuditLogsContext = React.createContext<AuditLogsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AuditLogsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AuditLogsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AuditLog | null>(null)

  return (
    <AuditLogsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AuditLogsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuditLogs = () => {
  const auditLogsContext = React.use(AuditLogsContext)

  if (!auditLogsContext) {
    throw new Error('useAuditLogs has to be used within <AuditLogsContext>')
  }

  return auditLogsContext
}
