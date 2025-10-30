import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface PerformanceRecord {
  id: string | number;
  worker: { name: string };
  product: { name: string };
  piecesMade: number;
  errorRate: number;
  createdAt: string;
}

interface Props {
  records: PerformanceRecord[];
  formatTime: (d: string) => string;
}

export default function RecentPerformance({ records, formatTime }: Props) {
  const { t } = useTranslation(["dashboard"]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activities.performance.title')}</CardTitle>
        <CardDescription>{t('activities.performance.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.slice(0, 5).map((record) => (
            <div key={record.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {record.worker.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(record.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {record.product.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{record.piecesMade} pcs</span>
                  <span className={`${record.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                    {record.errorRate.toFixed(1)}% error
                  </span>
                </div>
              </div>
            </div>
          ))}
          {(!records || records.length === 0) && (
            <div className="text-center text-muted-foreground py-4">
              {t('activities.performance.noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


