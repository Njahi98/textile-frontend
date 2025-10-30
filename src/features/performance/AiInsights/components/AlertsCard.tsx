import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AlertItem {
  type: 'warning' | 'critical' | 'info';
  message: string;
  action: string;
}

const AlertsCard: React.FC<{ alerts: AlertItem[] }> = ({ alerts }) => {
  const { t } = useTranslation(['aiInsights']);
  if (!alerts?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('criticalAlerts')}</CardTitle>
        <CardDescription>{t('criticalAlertsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={`${alert.type}-${alert.message}`} className={`rounded-md border ${alert.type === 'critical' ? 'border-destructive/50 bg-destructive/10' : alert.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : 'border-blue-500/40 bg-blue-500/10'} p-4`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {alert.type === 'critical' ? (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : alert.type === 'warning' ? (
                      <ShieldAlert className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600" />
                    )}
                    <h4 className="font-semibold">
                      {alert.type === 'critical' ? t('criticalAlert') : alert.type === 'warning' ? t('warningAlert') : t('infoAlert')}
                    </h4>
                  </div>
                  <p className="text-sm text-foreground/90">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{t('recommendedAction')}:</span> {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsCard;
