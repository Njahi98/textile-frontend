import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePerformanceRecords } from '../context/performance-records-context'

export function PerformanceRecordsPrimaryButtons() {
  const { setOpen } = usePerformanceRecords()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create Performance Record</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
