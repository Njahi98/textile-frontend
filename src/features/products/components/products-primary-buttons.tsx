import { Button } from '@/components/ui/button'
import { useProducts } from '../context/products-context'
import { PackagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next';

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  const { t } = useTranslation(['products']);
  
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>{t('addProduct')}</span> <PackagePlus size={18} />
      </Button>
    </div>
  )
}
