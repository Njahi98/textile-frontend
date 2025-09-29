import { Main } from '@/components/layout/main'
import { columns } from './components/products-columns'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsTable } from './components/products-table'
import { Product } from '@/services/product.api'
import ProductsProvider from './context/products-context'
import useSWR, { SWRResponse } from 'swr';
import { fetcher } from '@/lib/api'
import { ErrorState } from '@/components/error-state'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useTranslation } from 'react-i18next'

interface ProductsApiResponse  {
  success: boolean;
  products: Product[];
};

export default function Products() {

  const { data, error, isLoading, mutate }: SWRResponse<ProductsApiResponse, Error> = useSWR<ProductsApiResponse, Error>('/api/products', fetcher)
  const { t } = useTranslation(['products']);


  if (isLoading) return <LoadingSpinner/>
 if (error) {
  return (
    <ErrorState
      title={t("error.title")}
      message={
        typeof error.message === "string"
          ? error.message
          : t("error.unknown")
      }
      onRetry={() => void mutate()}
    />
  )
}
  if (!data?.success) return <div>{t('noProductsFound')}</div>;
  const productsList = data.products;
  return (
    <ProductsProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
          <p className='text-muted-foreground'>
            {t('description')}
          </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ProductsTable data={productsList} columns={columns} />
        </div>
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}

