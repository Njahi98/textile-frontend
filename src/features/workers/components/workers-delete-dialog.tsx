'use client'
import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Worker } from '../data/schema'
import { toast } from 'sonner'
import { workerApi } from '@/services/worker.api'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Worker
}

export function WorkersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { t } = useTranslation(['workers']);

  const handleDelete = async() => {
    try {
      if (value.trim() === currentRow.cin){
        const response = await workerApi.deleteWorker(String(currentRow.id))
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
      disabled={value.trim() !== currentRow.cin}
      title={
        <span className='text-destructive'>
          <TriangleAlert
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
            {t('dialogs.delete.title')}
        </span>
      }
      desc={
        <div className='space-y-4'>
        <p className='mb-2'>
          {t('dialogs.delete.confirmText', { name: currentRow.name })}
          <br />
          {t('dialogs.delete.warningText', { 
            cin: currentRow?.cin,
            role: currentRow?.role?.toUpperCase()
          })}
        </p>

        <Label className='my-2'>
          {t('dialogs.delete.cinLabel')}:
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('dialogs.delete.cinPlaceholder')}
          />
        </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('dialogs.delete.alertTitle')}</AlertTitle>
            <AlertDescription>
              {t('dialogs.delete.alertDescription')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('dialogs.delete.confirmButton')}
      destructive
    />
  )
}
