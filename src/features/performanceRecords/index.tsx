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
import { PerformanceRecord } from '@/services/performance.api'
import { performanceRecordSchema } from './data/schema'

export default function Performance() {
  interface PerformanceRecordsApiResponse {
    success: boolean;
    performanceRecords: PerformanceRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }

  const {
    data,
    error,
    isLoading,
    mutate,
  }: SWRResponse<PerformanceRecordsApiResponse, Error> = useSWR<PerformanceRecordsApiResponse, Error>(
    "/api/performance",
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title="Failed to load performance records"
        message={
          typeof error.message === "string"
            ? error.message
            : "An unknown error occurred."
        }
        onRetry={() => void mutate()}
      />
    );
  if (!data?.success) return <div>No performance records found.</div>;

  const validatedPerformanceRecords = data.performanceRecords.map(performanceRecord => {
    try {
      return performanceRecordSchema.parse(performanceRecord);
    } catch (error) {
      console.error('Invalid performance record data:', performanceRecord, error);
      return null;
    }
  }).filter(Boolean) as PerformanceRecord[];
  
  return (
    <PerformanceRecordsProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Performance Records</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your performance records for this month!
            </p>
          </div>
          <PerformanceRecordsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={validatedPerformanceRecords} columns={columns} />
        </div>
      </Main>

      <PerformanceRecordsDialogs />
    </PerformanceRecordsProvider>
  )
}
