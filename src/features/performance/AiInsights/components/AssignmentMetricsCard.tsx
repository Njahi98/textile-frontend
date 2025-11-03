import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface AssignmentMetrics {
  totalAssignments: number;
  assignmentCompliance: string; // example: "85.5%"
}

interface AssignmentMetricsCardProps {
  metrics?: AssignmentMetrics;
}

const AssignmentMetricsCard: React.FC<AssignmentMetricsCardProps> = ({ metrics }) => {
  const { t } = useTranslation(['aiInsights']);
  
  if (!metrics) return null;

  const complianceValue = parseFloat(metrics.assignmentCompliance || '0');
  const getComplianceColor = (value: number) => {
    if (value >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (value >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getComplianceIcon = (value: number) => {
    if (value >= 85) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('assignmentMetrics')}
        </CardTitle>
        <CardDescription>
          {t('assignmentMetricsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('totalAssignments')}
            </p>
            <p className="text-2xl font-bold">{metrics.totalAssignments}</p>
          </div>


          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {t('assignmentCompliance')}
              {getComplianceIcon(complianceValue)}
            </p>
            <Badge 
              variant="outline" 
              className={`text-lg px-3 py-1 ${getComplianceColor(complianceValue)} border`}
            >
              {metrics.assignmentCompliance}
            </Badge>
          </div>
        </div>


        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            {complianceValue >= 85 && (
              <>✅ {t('complianceGood')}</>
            )}
            {complianceValue >= 70 && complianceValue < 85 && (
              <>⚠️ {t('complianceFair')}</>
            )}
            {complianceValue < 70 && (
              <>❌ {t('compliancePoor')}</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentMetricsCard;