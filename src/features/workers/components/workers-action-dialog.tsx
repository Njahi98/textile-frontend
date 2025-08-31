'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Worker } from '../data/schema'
import { workerApi } from '@/services/worker.api'
import { toast } from 'sonner'

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'name is required.' }),
    phone: z.string().min(1, { message: 'Phone number is required.' }).optional(),
    cin: z.string().regex(/^\d{8}$/, {
      message: "CIN must be exactly 8 digits",
    }),
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Email is invalid.' }).optional(),
    role: z.string().min(1, { message: 'Role is required.' }).optional(),
    isEdit: z.boolean(),
  })
  
type WorkerForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: Worker
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const form = useForm<WorkerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          cin: currentRow.cin,
          email: currentRow.email ?? '',
          phone: currentRow.phone ?? '',
          role: currentRow.role ?? '',
          isEdit: true,
        }
      : {
          name: '',
          email: '',
          role: '',
          phone: '',
          cin: '',
          isEdit: false,
        },
  })

  const onSubmit = async (values: WorkerForm) => {
    try {
      form.reset();
      const { isEdit, ...workerData } = values;
      
      if (!isEdit) {
        const response = await workerApi.createWorker(workerData);
        if (response.success) {
          toast.success(response.message);
        }
      } else {
        const response = await workerApi.updateWorker(String(currentRow?.id), workerData);
        if (response.success) {
          toast.success(response.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('something went wrong');
      }
    } finally {
      onOpenChange(false);
    }
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the worker here. ' : 'Create new worker here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4  w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='worker-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john_doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name='cin'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Cin
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='12345678'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+123456789'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
             <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Role
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Supervisor, operator...'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='worker-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
