import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAssignmentSchema, SHIFT_OPTIONS } from '../data/schema'
import { assignmentApi, Assignment } from '@/services/assignment.api'
import { toast } from 'sonner'
import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { workerListSchema } from '@/features/workers/data/schema'
import { productionLineListSchema } from '@/features/productionLines/data/schema'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type AssignmentForm = z.infer<typeof createAssignmentSchema>

interface WorkersApiResponse {
  success: boolean;
  workers: z.infer<typeof workerListSchema>;
  message:string
}

interface ProductionLinesApiResponse {
  success: boolean;
  productionLines: z.infer<typeof productionLineListSchema>;
  message:string
}

export function AssignmentsMutateDrawer({ 
  open, 
  onOpenChange, 
  currentRow 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  currentRow?: Assignment; 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation(['assignment']);
  
  const isUpdate = !!currentRow

  
  const { data: workersData } = useSWR<WorkersApiResponse>('/api/workers', fetcher)
  const workers = workersData?.success ? workerListSchema.parse(workersData.workers) : []

  
  const { data: productionLinesData } = useSWR<ProductionLinesApiResponse>('/api/production-lines', fetcher)
  const productionLines = productionLinesData?.success ? productionLineListSchema.parse(productionLinesData.productionLines) : []

  const form = useForm<AssignmentForm>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: currentRow ? {
      workerId: currentRow.worker.id,
      productionLineId: currentRow.productionLine.id,
      position: String(currentRow.position),
      date: currentRow.date.toISOString().split('T')[0],
      shift: currentRow.shift,
    } : {
      workerId: 0,
      productionLineId: 0,
      position: '',
      date: new Date().toISOString().split('T')[0],
      shift: '',
    },
  })

  const onSubmit = async (data: AssignmentForm) => {
    try {
      setIsLoading(true)
      
      if (isUpdate && currentRow) {
        const updateResponse = await assignmentApi.updateAssignment(currentRow.id, data)
        if (updateResponse.success) {
          toast.success(updateResponse.message ||t('messages.updateSuccess'))
        }
      } else {
        const createResponse = await assignmentApi.createAssignment(data)
        if (createResponse.success) {
          toast.success(createResponse.message || t('messages.createSuccess'))
        }
      }
      
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.saveError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>
            {isUpdate ? t('dialogs.mutate.updateTitle') : t('dialogs.mutate.createTitle')}
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? t('dialogs.mutate.updateDescription') : t('dialogs.mutate.createDescription')}
          </SheetDescription> 
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className='flex-1 space-y-5 px-4'>
            <FormField
              control={form.control}
              name='workerId'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('form.worker')}</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={workers.map(worker => ({
                        value: worker.id.toString(),
                        label: `${worker.name} (${worker.cin})`
                      }))}
                      placeholder={t('form.selectWorker')}
                      defaultValue={field.value.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='productionLineId'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('form.productionLine')}</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={productionLines.map(line => ({
                        value: line.id.toString(),
                        label: `${line.name}${line.location ? ` - ${line.location}` : ''}`
                      }))}
                        placeholder={t('form.selectProductionLine')}
                      defaultValue={field.value.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='position'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('form.position')}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text"
                      placeholder={t('form.positionPlaceholder')} 
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='shift'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('form.shift')}</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={SHIFT_OPTIONS.map(shift => ({
                        value: shift.value,
                        label: shift.label
                      }))}
                      placeholder={t('form.selectShift')}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('form.date')}</FormLabel>
                  <FormControl>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(String(field.value)), 'PPP') : t('form.pickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(String(field.value)) : undefined}
                          onSelect={(date: Date | undefined) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className='flex justify-end space-x-2 gap-2 px-4 pb-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('dialogs.mutate.cancel')}
          </Button>
          <Button 
            type='submit' 
            disabled={isLoading}
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
              {isLoading ? t('dialogs.mutate.saving') : isUpdate ? t('dialogs.mutate.updateButton') : t('dialogs.mutate.createButton')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
