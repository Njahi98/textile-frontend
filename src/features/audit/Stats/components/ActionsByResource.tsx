import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Item { resource: string; count: number }

export default function ActionsByResource({ items }: { items?: Item[] }) {
  const { t } = useTranslation(['auditStats']);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('stats.sections.actionsByResource.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items?.slice(0, 10).map((item) => (
            <li key={item.resource} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.resource}</span>
              <span className="font-medium">{item.count}</span>
            </li>
          ))}
          {(!items || items.length === 0) && (
            <li className="text-sm text-muted-foreground">{t('stats.common.noData')}</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}


