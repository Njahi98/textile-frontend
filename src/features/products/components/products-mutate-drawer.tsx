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
import { Product } from '@/services/product.api'
import { productApi } from '@/services/product.api'
import { toast } from 'sonner'
import { useCallback, useMemo } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  code: z.string().min(1, 'Product code is required.'),
  description: z.string().nullable(),
  category: z.string().nullable(),
  unitPrice: z.number().nullable(),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export function ProductsMutateDrawer({ open, onOpenChange, currentRow, onSuccess }: Props) {
  const isUpdate = !!currentRow

  const defaultValues: FormData = useMemo(() => ({
    name: currentRow?.name ?? '',
    code: currentRow?.code ?? '',
    description: currentRow?.description ?? null,
    category: currentRow?.category ?? null,
    unitPrice: currentRow?.unitPrice ?? null,
    isActive: currentRow?.isActive ?? true,
  }), [currentRow])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = useCallback(async (data: FormData) => {
    try {
      if (isUpdate && currentRow) {
        await productApi.update(currentRow.id, data)
        toast.success('Product updated successfully')
      } else {
        await productApi.create(data)
        toast.success('Product created successfully')
      }
      
      onSuccess?.()
      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Product</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the product by providing necessary info. '
              : 'Add a new product by providing necessary info. '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='product-form'
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
                    <Input {...field} placeholder='Enter product name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter product code (SKU)' />
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
              name='category'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder='Enter category (e.g., shirts, pants, fabric)'
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='unitPrice'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder='Enter unit price'
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
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
          <Button form='product-form' type='submit'>
            {isUpdate ? 'Update' : 'Create'} Product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
