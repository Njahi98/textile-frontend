import LoadingSpinner from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useAuditStats } from "./hooks/useAuditStats";
import Header from "./components/Header";
import KPICards from "./components/KPICards";
import ActionsByType from "./components/ActionsByType";
import ActionsByResource from "./components/ActionsByResource";
import TopUsers from "./components/TopUsers";

export function AuditStats() {
  const { t } = useTranslation(['auditStats']);
  const { days, setDays, data, error, isLoading, mutate } = useAuditStats();

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );

  if (error) {
    return (
      <ErrorState
        title={t('stats.messages.loadError')}
        message={typeof error.message === "string" ? error.message : "An unknown error occurred."}
        onRetry={() => void mutate()}
      />
    );
  }

  if (!data?.success) return null;

  const stats = data.stats;

  return (
    <div className="space-y-6 p-6">
      <Header days={days} onChangeDays={setDays} />
      <KPICards stats={stats} />

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">{t('stats.tabs.actionsByType')}</TabsTrigger>
          <TabsTrigger value="resources">{t('stats.tabs.actionsByResource')}</TabsTrigger>
          <TabsTrigger value="users">{t('stats.tabs.topUsers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <ActionsByType items={stats.actionsByType} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <ActionsByResource items={stats.actionsByResource} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <TopUsers users={stats.topUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditStats;


