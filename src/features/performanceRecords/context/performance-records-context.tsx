import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { PerformanceRecord } from '../data/schema'

type PerformanceRecordsDialogType = 'create' | 'update' | 'delete'

interface PerformanceRecordsContextType {
  open: PerformanceRecordsDialogType | null
  setOpen: (str: PerformanceRecordsDialogType | null) => void
  currentRow: PerformanceRecord | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PerformanceRecord | null>>
}

const PerformanceRecordsContext = React.createContext<PerformanceRecordsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PerformanceRecordsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PerformanceRecordsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PerformanceRecord | null>(null)
  return (
    <PerformanceRecordsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PerformanceRecordsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePerformanceRecords = () => {
  const performanceRecordsContext = React.useContext(PerformanceRecordsContext)

  if (!performanceRecordsContext) {
    throw new Error('usePerformanceRecords has to be used within <PerformanceRecordsContext>')
  }

  return performanceRecordsContext
}
