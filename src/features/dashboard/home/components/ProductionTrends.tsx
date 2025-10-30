import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { useTranslation } from "react-i18next";

interface TrendsSummary {
  totalProduction: number;
  avgDailyProduction: number;
  trendPercentage: number;
}

interface TrendsDataPoint {
  date: string;
  production: number;
}

interface Trends {
  data: TrendsDataPoint[];
  summary?: TrendsSummary;
}

interface Props {
  trends?: Trends;
  formatDate: (d: string) => string;
}

export default function ProductionTrends({ trends, formatDate }: Props) {
  const { t } = useTranslation(["dashboard"]);
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t("charts.productionTrends.title")}</CardTitle>
        <CardDescription>{t("charts.productionTrends.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {trends?.data && trends.data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.data}>
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDate} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorProduction)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("common.noDataAvailable")}
          </div>
        )}
        {trends?.summary && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">{t("charts.productionTrends.totalProduction")}</p>
              <p className="text-lg font-semibold">{trends.summary.totalProduction.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("charts.productionTrends.dailyAverage")}</p>
              <p className="text-lg font-semibold">{Math.round(trends.summary.avgDailyProduction).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("charts.productionTrends.trend")}</p>
              <p className={`text-lg font-semibold ${trends.summary.trendPercentage > 0 ? 'text-green-500' : trends.summary.trendPercentage < 0 ? 'text-red-500' : ''}`}>
                {trends.summary.trendPercentage > 0 ? '+' : ''}{trends.summary.trendPercentage}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


