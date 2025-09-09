import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { workerApi, ImportRowError, ImportRowSuccess } from '@/services/worker.api'
import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'Please upload CSV format.'
    ),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkersImportDialog({ open, onOpenChange }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    results?: {
      success: ImportRowSuccess[]
      errors: ImportRowError[]
      total: number
    }
  } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    const fileList = form.getValues('file')
    
    if (!fileList?.[0]) {
      return
    }

    setIsLoading(true)
    setImportResult(null)

    try {
      const result = await workerApi.importWorkers(fileList[0])
      setImportResult(result)
      
      if (result.success) {
        form.reset()
      }
    } catch (error: unknown) {
      let message = 'Import failed. Please try again.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message = error.response?.data?.message ?? message;
      }
      setImportResult({
        success: false,
        message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setImportResult(null)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          handleClose()
        }
      }}
    >
      <DialogContent className='gap-4 sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle>Import Workers</DialogTitle>
          <DialogDescription>
            Import workers from a CSV file. Required columns: name, cin. Optional: email, phone, role.
          </DialogDescription>
        </DialogHeader>

        {importResult && (
          <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {importResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
              {importResult.message}
              {importResult.results && (
                <div className="mt-2 text-sm">
                  <div>Total processed: {importResult.results.total}</div>
                  <div className="text-green-600">Successful: {importResult.results.success.length}</div>
                  {importResult.results.errors.length > 0 && (
                    <div className="text-red-600">Errors: {importResult.results.errors.length}</div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {importResult?.results?.errors && importResult.results.errors.length > 0 && (
          <div className="max-h-32 overflow-y-auto">
            <div className="text-sm font-medium mb-2 text-red-600">Errors:</div>
            {importResult.results.errors.slice(0, 5).map((error, index) => (
              <div key={index} className="text-xs text-red-600 mb-1">
                Row {error.row}: {error.error}
              </div>
            ))}
            {importResult.results.errors.length > 5 && (
              <div className="text-xs text-red-600">
                ... and {importResult.results.errors.length - 5} more errors
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form id='worker-import-form' onSubmit={e => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='mb-2 space-y-1'>
                  <FormLabel>CSV File</FormLabel>
                  <FormControl>
                    <Input 
                      type='file' 
                      accept='.csv'
                      {...fileRef} 
                      className='h-10'
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline' disabled={isLoading}>
              Close
            </Button>
          </DialogClose>
          <Button 
            type='submit' 
            form='worker-import-form' 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}