import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPerformanceRecordSchema, SHIFT_OPTIONS } from '../data/schema'
import { performanceApi, PerformanceRecord } from '@/services/performance.api'
import { toast } from 'sonner'
import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { workerListSchema } from '@/features/workers/data/schema'
import { productionLineListSchema } from '@/features/productionLines/data/schema'
import {  Product } from '@/features/products/data/schema'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type PerformanceRecordForm = z.infer<typeof createPerformanceRecordSchema>

interface WorkersApiResponse {
  success: boolean;
  workers: z.infer<typeof workerListSchema>;
}

interface ProductionLinesApiResponse {
  success: boolean;
  productionLines: z.infer<typeof productionLineListSchema>;
}

interface ProductsApiResponse {
  success: boolean;
  products: Product[];
}

export function PerformanceRecordsMutateDrawer({ 
  open, 
  onOpenChange, 
  currentRow 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  currentRow?: PerformanceRecord; 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const isUpdate = !!currentRow

  // Fetch workers data
  const { data: workersData } = useSWR<WorkersApiResponse>('/api/workers', fetcher)
  const workers = workersData?.success ? workerListSchema.parse(workersData.workers) : []

  // Fetch production lines data
  const { data: productionLinesData } = useSWR<ProductionLinesApiResponse>('/api/production-lines', fetcher)
  const productionLines = productionLinesData?.success ? productionLineListSchema.parse(productionLinesData.productionLines) : []

  // Fetch products data
  const { data: productsData } = useSWR<ProductsApiResponse>('/api/products', fetcher)
  const products = productsData?.success ? productsData.products : []

  const form = useForm<PerformanceRecordForm>({
    resolver: zodResolver(createPerformanceRecordSchema),
    defaultValues: currentRow ? {
      workerId: currentRow.worker.id,
      productId: currentRow.product.id,
      productionLineId: currentRow.productionLine.id,
      date: currentRow.date,
      piecesMade: currentRow.piecesMade,
      shift: currentRow.shift || undefined,
      timeTaken: currentRow.timeTaken,
      errorRate: currentRow.errorRate,
    } : {
      workerId: 0,
      productId: 0,
      productionLineId: 0,
      date: new Date(),
      piecesMade: 0,
      shift: undefined,
      timeTaken: 0,
      errorRate: 0,
    },
  })

  const onSubmit = async (data: PerformanceRecordForm) => {
    try {
      setIsLoading(true)
      
      // Prepare the data, ensuring all required fields are present
      if (!data.shift) {
        toast.error('Shift is required')
        return
      }

      const submitData = {
        workerId: data.workerId,
        productId: data.productId,
        productionLineId: data.productionLineId,
        date: data.date,
        piecesMade: data.piecesMade,
        timeTaken: data.timeTaken,
        errorRate: data.errorRate,
        shift: data.shift
      }
      
      if (isUpdate && currentRow) {
        const response = await performanceApi.updatePerformanceRecord(currentRow.id, submitData)
        if (response.success) {
          toast.success('Performance record updated successfully')
        }
      } else {
        const response = await performanceApi.createPerformanceRecord(submitData)
        if (response.success) {
          toast.success('Performance record created successfully')
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
            {isUpdate ? 'Update Performance Record' : 'Create Performance Record'}
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? 'Update the performance record details below.' : 'Fill in the performance record details below.'}
          </SheetDescription>
        </SheetHeader>
        <div className='flex-1 overflow-y-auto'>
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className='space-y-5 px-4 py-4'>
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
              name='productId'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={products.map((product: Product) => ({
                        value: product.id.toString(),
                        label: `${product.name} (${product.code})`
                      }))}
                      placeholder="Select a product"
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
              name='piecesMade'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Pieces Made</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min="0"
                      placeholder='Enter number of pieces made' 
                      className='w-full'
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='timeTaken'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Time Taken (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder='Enter time taken in hours' 
                      className='w-full'
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='errorRate'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Error Rate (%)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder='Enter error rate percentage' 
                      className='w-full'
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      defaultValue={field.value ?? ''}
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) => date < new Date('1900-01-01')}
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
        </div>
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
