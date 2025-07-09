import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ProductionLine } from '../data/schema'
import { productionLineApi } from '@/services/productionLine.api'
import { toast } from 'sonner'
import { useCallback, useMemo } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ProductionLine
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().nullable(),
  capacity: z.number().nullable(),
  isActive: z.boolean(),
  targetOutput: z.number().nullable(),
  location: z.string().nullable(),
})

type FormData = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow, onSuccess }: Props) {
  const isUpdate = !!currentRow

  const defaultValues: FormData = useMemo(() => ({
    name: currentRow?.name ?? '',
    description: currentRow?.description ?? null,
    capacity: currentRow?.capacity ?? null,
    isActive: currentRow?.isActive ?? true,
    targetOutput: currentRow?.targetOutput ?? null,
    location: currentRow?.location ?? null,
  }), [currentRow])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = useCallback(async (data: FormData) => {
    try {
      if (isUpdate && currentRow) {
        await productionLineApi.update(currentRow.id, data)
        toast.success('Production line updated successfully')
      } else {
        await productionLineApi.create(data)
        toast.success('Production line created successfully')
      }
      
      onSuccess?.()
      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save production line')
    }
  }, [isUpdate, currentRow, onSuccess, onOpenChange, form, defaultValues])

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset(defaultValues)
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Production Line</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the production line by providing necessary info. '
              : 'Add a new production line by providing necessary info. '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='production-line-form'
            onSubmit={(e) => {
              void form.handleSubmit(handleSubmit)(e)
            }}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter production line name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder='Enter description'
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='capacity'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder='Enter capacity'
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='targetOutput'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Target Output</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder='Enter target output'
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder='Enter location'
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button form='production-line-form' type='submit'>
            {isUpdate ? 'Update' : 'Create'} Production Line
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
