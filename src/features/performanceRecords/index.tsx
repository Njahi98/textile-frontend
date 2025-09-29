import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { PerformanceRecordsDialogs } from './components/performance-records-dialogs'
import { PerformanceRecordsPrimaryButtons } from './components/performance-records-primary-buttons'
import PerformanceRecordsProvider from './context/performance-records-context'
import { fetcher } from '@/lib/api'
import useSWR, { SWRResponse } from 'swr'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/error-state'
import { PerformanceRecordsResponse, PerformanceRecordQueryParams } from '@/services/performance.api'
import { performanceRecordListSchema } from './data/schema'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Performance() {
  const [queryParams, setQueryParams] = useState<PerformanceRecordQueryParams>({
    page: 1,
    limit: 50,
  });
  const { t } = useTranslation(['performanceRecords']);

  const {
    data,
    error,
    isLoading,
    mutate,
  }: SWRResponse<PerformanceRecordsResponse, Error> = useSWR<PerformanceRecordsResponse, Error>(
    `/api/performance?${new URLSearchParams({
      page: queryParams.page?.toString() ?? '1',
      limit: queryParams.limit?.toString() ?? '50',
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.workerId && { workerId: queryParams.workerId.toString() }),
      ...(queryParams.productId && { productId: queryParams.productId.toString() }),
      ...(queryParams.productionLineId && { productionLineId: queryParams.productionLineId.toString() }),
      ...(queryParams.shift && { shift: queryParams.shift }),
      ...(queryParams.search && { search: queryParams.search }),
    }).toString()}`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title={t('failedToLoadRecords')}
        message={
          typeof error.message === "string"
            ? error.message
            : t('unknownError')
        }
        onRetry={() => void mutate()}
      />
    );
    if (!data?.success) return <div>{t('noRecordsFound')}</div>;

  const performanceRecordList = performanceRecordListSchema.parse(data.performanceRecords);
  
  return (
    <PerformanceRecordsProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground'>
            {t('description')}
            </p>
          </div>
          <PerformanceRecordsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 space-y-6 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable 
            data={performanceRecordList} 
            columns={columns} 
            pagination={data.pagination}
            onQueryChange={setQueryParams}
            queryParams={queryParams}
          />
        </div>
      </Main>

      <PerformanceRecordsDialogs />
    </PerformanceRecordsProvider>
  )
}