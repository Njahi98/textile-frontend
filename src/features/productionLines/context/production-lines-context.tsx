import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { ProductionLine } from '../data/schema'


type ProductionLinesDialogType = 'add' | 'edit' | 'delete' | 'import'

interface ProductionLinesContextType {
  open: ProductionLinesDialogType | null
  setOpen: (str: ProductionLinesDialogType | null) => void
  currentRow: ProductionLine | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ProductionLine | null>>
}

const ProductionLinesContext = React.createContext<ProductionLinesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ProductionLinesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProductionLinesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductionLine | null>(null)

  return (
    <ProductionLinesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductionLinesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProductionLines = () => {
  const productionLinesContext = React.use(ProductionLinesContext)

  if (!productionLinesContext) {
    throw new Error('useProductionLines has to be used within <ProductionLinesContext>')
  }

  return productionLinesContext
}
