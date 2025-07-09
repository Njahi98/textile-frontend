import { Main } from '@/components/layout/main'
import { columns } from './components/production-lines-columns'
import { ProductionLinesDialogs } from './components/production-lines-dialogs'
import { ProductionLinesPrimaryButtons } from './components/production-lines-primary-buttons'
import { ProductionLinesTable } from './components/production-lines-table'
import { ProductionLine, productionLineListSchema } from './data/schema'
import ProductionLinesProvider from './context/production-lines-context'
import useSWR, { SWRResponse } from 'swr';
import { fetcher } from '@/lib/api'
import { ErrorState } from '@/components/error-state'
import LoadingSpinner from '@/components/LoadingSpinner'

interface ProductionLinesApiResponse  {
  success: boolean;
  productionLines: ProductionLine[];
};

export default function ProductionLines() {

  const { data, error, isLoading, mutate }: SWRResponse<ProductionLinesApiResponse, Error> = useSWR<ProductionLinesApiResponse, Error>('/api/production-lines', fetcher)

  if (isLoading) return <LoadingSpinner/>
  if (error) return <ErrorState 
    title="Failed to load production lines" 
    message={typeof error.message === 'string' ? error.message : 'An unknown error occurred.'}
    onRetry={() => void mutate()} 
  />
  if (!data?.success) return <div>No production lines found.</div>;
  const productionLineList = productionLineListSchema.parse(data.productionLines);
  return (
    <ProductionLinesProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Production Lines List</h2>
            <p className='text-muted-foreground'>
              Manage your production lines here.
            </p>
          </div>
          <ProductionLinesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ProductionLinesTable data={productionLineList} columns={columns} />
        </div>
      </Main>

      <ProductionLinesDialogs />
    </ProductionLinesProvider>
  )
}

