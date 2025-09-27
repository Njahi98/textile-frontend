'use client'
import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User } from '../data/schema'
import { userApi } from '@/services/user.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { t } = useTranslation(['users'])

  const handleDelete = async() => {
    try {
      if (value.trim() === currentRow.username){
        const response = await userApi.deleteUser(String(currentRow.id))
        if(response.success){
          toast.success(response.message)
        }
      } 
    } catch (error) {
      if(error instanceof Error){
        toast.error(error.message)
      }else{  
      toast.error('something went wrong')
      }
    }finally{
      onOpenChange(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          {t('dialog.delete.title')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('dialog.delete.description')}{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            {t('dialog.delete.warning', { role: currentRow.role.toUpperCase() })}
          </p>

          <Label className='my-2'>
            {t('dialog.delete.confirmLabel')}
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('messages.confirmDelete')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('dialog.delete.alertTitle')}</AlertTitle>
            <AlertDescription>
              {t('dialog.delete.alertDescription')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('buttons.delete')}
      destructive
    />
  )
}
