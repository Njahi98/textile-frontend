import { Button } from '@/components/ui/button'
import { useUsers } from '../context/users-context'
import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next';


export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const { t } = useTranslation(['users']);
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>{t('buttons.addUser')}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
