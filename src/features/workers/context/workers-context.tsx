import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Worker } from '../data/schema'

type WorkersDialogType = 'add' | 'edit' | 'delete' | 'import'

interface WorkersContextType {
  open: WorkersDialogType | null
  setOpen: (str: WorkersDialogType | null) => void
  currentRow: Worker | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Worker | null>>
}

const WorkersContext = React.createContext<WorkersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function WorkersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<WorkersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Worker | null>(null)

  return (
    <WorkersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </WorkersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkers = () => {
  const workersContext = React.use(WorkersContext)

  if (!workersContext) {
    throw new Error('useWorkers has to be used within <WorkersContext>')
  }

  return workersContext
}
