import { Main } from "@/components/layout/main";
import { columns } from "./components/workers-columns";
import { WorkersDialogs } from "./components/workers-dialogs";
import { WorkersPrimaryButtons } from "./components/workers-primary-buttons";
import { WorkersTable } from "./components/workers-table";
import { Worker, workerListSchema } from "./data/schema";
import WorkersProvider from "./context/workers-context";
import useSWR, { SWRResponse } from "swr";
import { fetcher } from "@/lib/api";
import { ErrorState } from "@/components/error-state";
import LoadingSpinner from "@/components/LoadingSpinner";

interface WorkersApiResponse {
  success: boolean;
  workers: Worker[];
}

export default function Workers() {
  const {
    data,
    error,
    isLoading,
    mutate,
  }: SWRResponse<WorkersApiResponse, Error> = useSWR<WorkersApiResponse, Error>(
    "/api/workers",
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title="Failed to load workers"
        message={
          typeof error.message === "string"
            ? error.message
            : "An unknown error occurred."
        }
        onRetry={() => void mutate()}
      />
    );
  if (!data?.success) return <div>No workers found.</div>;

  const workerList = workerListSchema.parse(data.workers);

  return (
    <WorkersProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Worker List</h2>
            <p className="text-muted-foreground">
              Manage your workers and their roles here.
            </p>
          </div>
          <WorkersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <WorkersTable data={workerList} columns={columns} />
        </div>
      </Main>

      <WorkersDialogs />
    </WorkersProvider>
  );
}
