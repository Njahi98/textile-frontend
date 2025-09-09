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

type AssignmentForm = z.infer<typeof createAssignmentSchema>

interface WorkersApiResponse {
  success: boolean;
  workers: z.infer<typeof workerListSchema>;
}

interface ProductionLinesApiResponse {
  success: boolean;
  productionLines: z.infer<typeof productionLineListSchema>;
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
        const response = await assignmentApi.updateAssignment(currentRow.id, data)
        if (response.success) {
          toast.success('Assignment updated successfully')
        }
      } else {
        const response = await assignmentApi.createAssignment(data)
        if (response.success) {
          toast.success('Assignment created successfully')
        }
      }
      
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>
            {isUpdate ? 'Update Assignment' : 'Create Assignment'}
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? 'Update the assignment details below.' : 'Fill in the assignment details below.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className='flex-1 space-y-5 px-4'>
            <FormField
              control={form.control}
              name='workerId'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Worker</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={workers.map(worker => ({
                        value: worker.id.toString(),
                        label: `${worker.name} (${worker.cin})`
                      }))}
                      placeholder="Select a worker"
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
                  <FormLabel>Production Line</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={productionLines.map(line => ({
                        value: line.id.toString(),
                        label: `${line.name}${line.location ? ` - ${line.location}` : ''}`
                      }))}
                      placeholder="Select a production line"
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
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="text"
                      placeholder='Enter position number' 
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
                  <FormLabel>Shift</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={SHIFT_OPTIONS.map(shift => ({
                        value: shift.value,
                        label: shift.label
                      }))}
                      placeholder="Select a shift"
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
                  <FormLabel>Date</FormLabel>
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
                          {field.value ? format(new Date(String(field.value)), 'PPP') : 'Pick a date'}
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
            Cancel
          </Button>
          <Button 
            type='submit' 
            disabled={isLoading}
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
            {isLoading ? 'Saving...' : isUpdate ? 'Update' : 'Create'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
