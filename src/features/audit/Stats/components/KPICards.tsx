import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Database, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Period { startDate: string; endDate: string }
interface StatsShape {
  totalActions: number;
  period: Period;
  actionsByType?: { action: string; count: number }[];
  actionsByResource?: { resource: string; count: number }[];
  topUsers?: { id: number; username: string; action_count: number }[];
}

export default function KPICards({ stats }: { stats: StatsShape }) {
  const { t } = useTranslation(['auditStats']);
  return (
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
              endDate: new Date(stats.period.endDate).toLocaleDateString(),
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
  );
}


