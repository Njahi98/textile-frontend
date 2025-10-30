import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/api";
import { AuditStatsResponse } from "@/services/auditLog.api";

export function useAuditStats() {
  const [days, setDays] = useState<number>(30);
  const { data, error, isLoading, mutate } = useSWR<AuditStatsResponse, Error>(
    `/api/audit-logs/stats?days=${days}`,
    fetcher
  );

  return {
    days,
    setDays,
    data,
    error,
    isLoading,
    mutate,
  };
}


