import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductionLine {
  id?: string | number;
  name?: string;
  isActive?: boolean;
  targetOutput?: number | null;
}

interface MetricItem {
  productionLine?: ProductionLine | null;
  production: number;
  avgErrorRate: number;
  avgTimeTaken: number;
  efficiency: number | null;
}

interface Props {
  metrics: MetricItem[];
}

export default function ProductionLines({ metrics }: Props) {
  const { t } = useTranslation(["dashboard"]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('charts.productionLines.title')}</CardTitle>
        <CardDescription>{t('charts.productionLines.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.productionLine?.id || Math.random()} className="space-y-2">
                <div className="sm:flex items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {metric.productionLine?.name || 'Unknown Line'}
                    </span>
                    {metric.productionLine?.isActive ? (
                      <Badge variant="default" className="h-5">{t('status.active')}</Badge>
                    ) : (
                      <Badge variant="secondary" className="h-5">{t('status.inactive')}</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{metric.production.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">pcs</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className={`font-medium ${metric.avgErrorRate > 5 ? 'text-red-500' : ''}`}>
                        {metric.avgErrorRate.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground ml-1">error</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{metric.avgTimeTaken.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">hours</span>
                    </div>
                  </div>
                </div>
                {metric.efficiency !== null && metric.productionLine?.targetOutput && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('metrics.efficiency')}</span>
                      <span>{metric.efficiency.toFixed(1)}% of target ({metric.productionLine.targetOutput.toLocaleString()} pcs)</span>
                    </div>
                    <Progress 
                      value={Math.min(metric.efficiency, 100)} 
                      className={`h-2 ${
                        metric.efficiency >= 90 ? '[&>div]:bg-green-500' :
                        metric.efficiency >= 70 ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {t('charts.productionLines.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


