import { Main } from "@/components/layout/main";
import { columns } from "./components/audit-logs-columns";
import { AuditLogsDialogs } from "./components/audit-logs-dialogs";
import { AuditLogsPrimaryButtons } from "./components/audit-logs-primary-buttons";
import { AuditLogsTable } from "./components/audit-logs-table";
import { auditLogListSchema } from "./data/schema";
import AuditLogsProvider from "./context/audit-logs-context";
import useSWR, { SWRResponse } from "swr";
import { fetcher } from "@/lib/api";
import { ErrorState } from "@/components/error-state";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";
import { AuditLogsResponse, AuditLogQueryParams } from "@/services/auditLog.api";

export default function AuditLogs() {
  const [queryParams, setQueryParams] = useState<AuditLogQueryParams>({
    page: 1,
    limit: 50,
  });

  const {
    data,
    error,
    isLoading,
    mutate,
  }: SWRResponse<AuditLogsResponse, Error> = useSWR<AuditLogsResponse, Error>(
    `/api/audit-logs?${new URLSearchParams({
      page: queryParams.page?.toString() ?? '1',
      limit: queryParams.limit?.toString() ?? '50',
      ...(queryParams.startDate && { startDate: queryParams.startDate }),
      ...(queryParams.endDate && { endDate: queryParams.endDate }),
      ...(queryParams.userId && { userId: queryParams.userId.toString() }),
      ...(queryParams.action && { action: queryParams.action }),
      ...(queryParams.resource && { resource: queryParams.resource }),
      ...(queryParams.search && { search: queryParams.search }),
    }).toString()}`,
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorState
        title="Failed to load audit logs"
        message={
          typeof error.message === "string"
            ? error.message
            : "An unknown error occurred."
        }
        onRetry={() => void mutate()}
      />
    );
  if (!data?.success) return <div>No audit logs found.</div>;

  const auditLogList = auditLogListSchema.parse(data.auditLogs);

  return (
    <AuditLogsProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
            <p className="text-muted-foreground">
              View and manage system audit logs and user activities.
            </p>
          </div>
          <AuditLogsPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 space-y-6 lg:flex-row lg:space-y-0 lg:space-x-12">
          <AuditLogsTable 
            data={auditLogList} 
            columns={columns} 
            pagination={data.pagination}
            onQueryChange={setQueryParams}
            queryParams={queryParams}
          />
        </div>
      </Main>

      <AuditLogsDialogs />
    </AuditLogsProvider>
  );
}
