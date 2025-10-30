import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface AssignmentItem {
  id: string | number;
  worker: { name: string };
  productionLine: { name: string };
  position: string;
  shift: string;
  createdAt: string;
}

interface Props {
  assignments: AssignmentItem[];
  formatTime: (d: string) => string;
}

export default function RecentAssignments({ assignments, formatTime }: Props) {
  const { t } = useTranslation(["dashboard"]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activities.assignments.title')}</CardTitle>
        <CardDescription>{t('activities.assignments.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assignments.slice(0, 5).map((assignment) => (
            <div key={assignment.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {assignment.worker.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(assignment.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {assignment.productionLine.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {assignment.position}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {assignment.shift}
                </Badge>
              </div>
            </div>
          ))}
          {(!assignments || assignments.length === 0) && (
            <div className="text-center text-muted-foreground py-4">
              {t('activities.assignments.noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


