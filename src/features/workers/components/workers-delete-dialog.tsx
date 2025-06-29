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

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Worker
}

export function WorkersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')

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
          Delete Worker
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the worker with the role of{' '}
            <span className='font-bold'>
              {currentRow?.role?.toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Cin:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter cin to confirm deletion.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
