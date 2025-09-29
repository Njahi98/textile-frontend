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
import { useTranslation } from 'react-i18next'

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

export function ProductionLinesMutateDrawer({ open, onOpenChange, currentRow, onSuccess }: Props) {
  const { t } = useTranslation(['productionLines']);
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
        const updateResponse = await productionLineApi.update(currentRow.id, data)
        if(updateResponse.success){
          toast.success(updateResponse.message)
        }
      } else {
        const createResponse =  await productionLineApi.create(data)
         if(createResponse.success){
          toast.success(createResponse.message)
        }
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
          <SheetTitle>{isUpdate ? t('dialogs.mutate.updateTitle') : t('dialogs.mutate.createTitle')}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? t('dialogs.mutate.updateDescription')
              : t('dialogs.mutate.createDescription')}
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
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('form.namePlaceholder')} />
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
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={t('form.descriptionPlaceholder')}
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
                  <FormLabel>{t('form.capacity')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={t('form.capacityPlaceholder')}
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
                  <FormLabel>{t('form.targetOutput')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder={t('form.targetOutputPlaceholder')}
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
                  <FormLabel>{t('form.location')}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder={t('form.locationPlaceholder')}
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
            <Button variant='outline'>{t('dialogs.mutate.cancel')}</Button>
          </SheetClose>
          <Button form='production-line-form' type='submit'>
            {isUpdate ? t('dialogs.mutate.updateButton') : t('dialogs.mutate.createButton')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
