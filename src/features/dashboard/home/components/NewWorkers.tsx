import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface WorkerItem {
  id: string | number;
  name: string;
  cin: string;
  role?: string | null;
  createdAt: string;
}

interface Props {
  workers: WorkerItem[];
  formatDate: (d: string) => string;
}

export default function NewWorkers({ workers, formatDate }: Props) {
  const { t } = useTranslation(["dashboard"]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activities.newWorkers.title')}</CardTitle>
        <CardDescription>{t('activities.newWorkers.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workers.slice(0, 5).map((worker) => (
            <div key={worker.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{worker.name}</p>
                <p className="text-xs text-muted-foreground">{worker.cin}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {worker.role || t('common.noRole')}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(worker.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {(!workers || workers.length === 0) && (
            <div className="text-center text-muted-foreground py-4">
              {t('activities.newWorkers.noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


