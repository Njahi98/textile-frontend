import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface UserItem { id: number; username: string; email?: string; action_count: number }

export default function TopUsers({ users }: { users?: UserItem[] }) {
  const { t } = useTranslation(['auditStats']);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('stats.sections.topUsers.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {users?.slice(0, 10).map((user) => (
            <li key={user.id} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {user.username} <span className="text-muted-foreground">({user.email})</span>
              </span>
              <span className="font-medium">{user.action_count}</span>
            </li>
          ))}
          {(!users || users.length === 0) && (
            <li className="text-sm text-muted-foreground">{t('stats.common.noData')}</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}


