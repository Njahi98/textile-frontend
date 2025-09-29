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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(['workers']);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title={t('errors.failedToLoad')}
        message={
          typeof error.message === "string"
            ? error.message
            : t('errors.unknownError')
        }
        onRetry={() => void mutate()}
      />
    );

  if (!data?.success) return <div>{t('errors.noWorkersFound')}</div>;


  const workerList = workerListSchema.parse(data.workers);

  return (
    <WorkersProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('header.title')}</h2>
            <p className="text-muted-foreground">
              {t('header.subtitle')}
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
