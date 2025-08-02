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
import { Product, UpdateProductData } from '@/services/product.api'
import { productApi } from '@/services/product.api'
import { toast } from 'sonner'
import { useCallback, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Image as ImageIcon } from 'lucide-react'

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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isDeletingImage, setIsDeletingImage] = useState(false)

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

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleDeleteImage = async () => {
    if (!currentRow?.id) return
    
    setIsDeletingImage(true)
    try {
      await productApi.deleteImage(currentRow.id)
      toast.success('Image deleted successfully')
      setImagePreview(null)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    } finally {
      setIsDeletingImage(false)
    }
  }

  const handleSubmit = useCallback(async (data: FormData) => {
    try {
      if (isUpdate && currentRow) {
        // For updates, only send fields that are actually being changed
        const updateData: UpdateProductData = {}
        
        // Only include fields that are different from current values
        if (data.name !== currentRow.name) updateData.name = data.name
        if (data.code !== currentRow.code) updateData.code = data.code
        if (data.description !== currentRow.description) updateData.description = data.description
        if (data.category !== currentRow.category) updateData.category = data.category
        if (data.unitPrice !== currentRow.unitPrice) updateData.unitPrice = data.unitPrice
        if (data.isActive !== currentRow.isActive) updateData.isActive = data.isActive
        
        // Add image if provided
        if (selectedImage) {
          updateData.image = selectedImage
        }
        
        // Only make the API call if there are changes
        if (Object.keys(updateData).length > 0) {
          await productApi.update(currentRow.id, updateData)
          toast.success('Product updated successfully')
        } else {
          toast.info('No changes to save')
        }
      } else {
        // For create, send form data plus image
        const createData = {
          ...data,
          image: selectedImage ?? undefined
        }
        await productApi.create(createData)
        toast.success('Product created successfully')
      }
      
      onSuccess?.()
      onOpenChange(false)
      form.reset(defaultValues)
      setImagePreview(null)
      setSelectedImage(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    }
  }, [isUpdate, currentRow, selectedImage, onSuccess, onOpenChange, form, defaultValues])

  const currentImageUrl = currentRow?.imageUrl

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset(defaultValues)
          setImagePreview(null)
          setSelectedImage(null)
        }
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
        <div className='flex-1 overflow-y-auto'>
          <Form {...form}>
            <form
              id='product-form'
              onSubmit={(e) => {
                void form.handleSubmit(handleSubmit)(e)
              }}
              className='space-y-5 px-4 py-4'
            >
              {/* Image Upload Section */}
              <FormItem className='space-y-1'>
                <FormLabel>Product Image</FormLabel>
                <div className='space-y-3'>
                  {/* Current Image Display */}
                  {(currentImageUrl ?? imagePreview) && (
                    <div className='relative inline-block'>
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={imagePreview ?? currentImageUrl ?? undefined} 
                          alt="Product preview" 
                        />
                        <AvatarFallback className="text-xs">
                          <ImageIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      {isUpdate && currentImageUrl && !imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() => void handleDeleteImage()}
                          disabled={isDeletingImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* File Input */}
                  <div className='flex items-center gap-2'>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        handleImageChange(file)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleImageChange(null)
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </FormItem>

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
        </div>
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
