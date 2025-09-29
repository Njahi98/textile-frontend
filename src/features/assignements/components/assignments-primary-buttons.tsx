import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssignments } from '../context/assignments-context'
import { useTranslation } from 'react-i18next';

export function AssignmentsPrimaryButtons() {
  const { setOpen } = useAssignments()
  const { t } = useTranslation(['assignment']);
  
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>{t('buttons.createAssignment')}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
