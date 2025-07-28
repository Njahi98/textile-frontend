import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { AssignmentsDialogs } from './components/assignments-dialogs'
import { AssignmentsPrimaryButtons } from './components/assignments-primary-buttons'
import AssignmentsProvider from './context/assignments-context'
import { fetcher } from '@/lib/api'
import useSWR, { SWRResponse } from 'swr'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/error-state'
import { Assignment } from '@/services/assignment.api'
import { assignmentSchema } from './data/schema'

export default function Assignments() {
  interface AssignmentsApiResponse {
    success: boolean;
    assignments: Assignment[];
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
  }: SWRResponse<AssignmentsApiResponse, Error> = useSWR<AssignmentsApiResponse, Error>(
    "/api/assignments",
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title="Failed to load assignments"
        message={
          typeof error.message === "string"
            ? error.message
            : "An unknown error occurred."
        }
        onRetry={() => void mutate()}
      />
    );
  if (!data?.success) return <div>No assignments found.</div>;

  const validatedAssignments = data.assignments.map(assignment => {
    try {
      return assignmentSchema.parse(assignment);
    } catch (error) {
      console.error('Invalid assignment data:', assignment, error);
      return null;
    }
  }).filter(Boolean) as Assignment[];
  return (
    <AssignmentsProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Assignments</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your assignments for this month!
            </p>
          </div>
          <AssignmentsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={validatedAssignments} columns={columns} />
        </div>
      </Main>

      <AssignmentsDialogs />
    </AssignmentsProvider>
  )
}
