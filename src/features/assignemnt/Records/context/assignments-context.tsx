import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Assignment } from '../data/schema'

type AssignmentsDialogType = 'create' | 'update' | 'delete'

interface AssignmentsContextType {
  open: AssignmentsDialogType | null
  setOpen: (str: AssignmentsDialogType | null) => void
  currentRow: Assignment | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Assignment | null>>
}

const AssignmentsContext = React.createContext<AssignmentsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AssignmentsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AssignmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Assignment | null>(null)
  return (
    <AssignmentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AssignmentsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAssignments = () => {
  const assignmentsContext = React.useContext(AssignmentsContext)

  if (!assignmentsContext) {
    throw new Error('useAssignments has to be used within <AssignmentsContext>')
  }

  return assignmentsContext
}
