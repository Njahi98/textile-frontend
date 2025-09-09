import { Button } from '@/components/ui/button'
import { useProductionLines } from '../context/production-lines-context'
import { PackagePlus } from 'lucide-react'

export function ProductionLinesPrimaryButtons() {
  const { setOpen } = useProductionLines()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Production line</span> <PackagePlus size={18} />
      </Button>
    </div>
  )
}
