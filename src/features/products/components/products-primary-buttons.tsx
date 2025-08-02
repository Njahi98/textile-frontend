import { Button } from '@/components/ui/button'
import { useProducts } from '../context/products-context'
import { PackagePlus } from 'lucide-react'

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Product</span> <PackagePlus size={18} />
      </Button>
    </div>
  )
}
