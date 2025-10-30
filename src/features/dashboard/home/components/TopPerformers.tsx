import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface WorkerInfo {
  id?: string | number;
  name?: string;
  cin?: string;
}

interface Performer {
  worker?: WorkerInfo | null;
  production: number;
  avgErrorRate: number;
}

interface Props {
  performers: Performer[];
}

export default function TopPerformers({ performers }: Props) {
  const { t } = useTranslation(["dashboard"]);
  const topFive = performers.slice(0, 5);
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>{t('charts.topPerformers.title')}</CardTitle>
        <CardDescription>{t('charts.topPerformers.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topFive.map((performer, index) => (
            <div key={performer.worker?.id || index} className="flex items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <span className="text-sm font-semibold">{index + 1}</span>
              </div>
              <div className="ml-4 space-y-1 flex-1">
                <p className="text-sm font-medium leading-none">
                  {performer.worker?.name || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {performer.worker?.cin || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {performer.production.toLocaleString()} pcs
                </p>
                <p className="text-xs text-muted-foreground">
                  {performer.avgErrorRate.toFixed(1)}% error
                </p>
              </div>
            </div>
          ))}
          {topFive.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {t('charts.topPerformers.noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


