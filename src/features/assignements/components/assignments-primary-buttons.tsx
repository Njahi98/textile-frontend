import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssignments } from '../context/assignments-context'

export function AssignmentsPrimaryButtons() {
  const { setOpen } = useAssignments()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create Assignment</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
