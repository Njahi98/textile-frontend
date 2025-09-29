import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/error-state";
import { AuditStatsResponse } from "@/services/auditLog.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Database, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuditStats() {
  const [days, setDays] = useState<number>(30);
  const { t } = useTranslation(['auditStats']);

  const { data, error, isLoading, mutate } = useSWR<AuditStatsResponse, Error>(
    `/api/audit-logs/stats?days=${days}`,
    fetcher
  );

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('stats.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('stats.pageDescription')}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t('stats.filters.days')}</label>
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
          >
            <option value={7}>7</option>
            <option value={14}>14</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.cards.totalActions.title')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.cards.totalActions.period', { 
                startDate: new Date(stats.period.startDate).toLocaleDateString(),
                endDate: new Date(stats.period.endDate).toLocaleDateString()
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.cards.topAction.title')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actionsByType?.[0]?.action ?? t('common.noData')}</div>
            <p className="text-xs text-muted-foreground">{t('stats.cards.topAction.events', { count: stats.actionsByType?.[0]?.count ?? 0 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.cards.topResource.title')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actionsByResource?.[0]?.resource ?? t('common.noData')}</div>
            <p className="text-xs text-muted-foreground">{t('stats.cards.topResource.events', { count: stats.actionsByResource?.[0]?.count ?? 0 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.cards.mostActiveUser.title')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold truncate">{stats.topUsers?.[0]?.username ?? t('common.noData')}</div>
          <p className="text-xs text-muted-foreground">{t('stats.cards.mostActiveUser.actions', { count: stats.topUsers?.[0]?.action_count ?? 0 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sections */}
      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">{t('stats.tabs.actionsByType')}</TabsTrigger>
          <TabsTrigger value="resources">{t('stats.tabs.actionsByResource')}</TabsTrigger>
          <TabsTrigger value="users">{t('stats.tabs.topUsers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.sections.actionsByType.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.actionsByType?.slice(0, 10).map((item) => (
                  <li key={item.action} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.action}</span>
                    <span className="font-medium">{item.count}</span>
                  </li>
                ))}
                {(!stats.actionsByType || stats.actionsByType.length === 0) && (
                  <li className="text-sm text-muted-foreground">{t('stats.common.noData')}</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.sections.actionsByResource.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.actionsByResource?.slice(0, 10).map((item) => (
                  <li key={item.resource} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.resource}</span>
                    <span className="font-medium">{item.count}</span>
                  </li>
                ))}
                {(!stats.actionsByResource || stats.actionsByResource.length === 0) && (
                  <li className="text-sm text-muted-foreground">{t('stats.common.noData')}</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.sections.topUsers.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.topUsers?.slice(0, 10).map((user) => (
                  <li key={user.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">
                      {user.username} <span className="text-muted-foreground">({user.email})</span>
                    </span>
                    <span className="font-medium">{user.action_count}</span>
                  </li>
                ))}
                {(!stats.topUsers || stats.topUsers.length === 0) && (
                  <li className="text-sm text-muted-foreground">{t('stats.common.noData')}</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuditStats;


