import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface KPICardsProps {
  overallEfficiency: number;
  qualityScore: number;
  productivityTrend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

const getRiskColor = (level: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'high':
      return 'text-red-700 bg-red-100';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100';
    case 'low':
      return 'text-green-700 bg-green-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

const KPICards: React.FC<KPICardsProps> = ({ overallEfficiency, qualityScore, productivityTrend, riskLevel }) => {
  const { t } = useTranslation(['aiInsights']);
  const trendColor = productivityTrend === 'improving' ? 'text-green-600' : productivityTrend === 'declining' ? 'text-red-600' : 'text-blue-600';
  const trendLabel = productivityTrend === 'improving' ? t('improving') : productivityTrend === 'declining' ? t('declining') : t('stable');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> {t('overallEfficiency')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{overallEfficiency.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('qualityScore')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{qualityScore.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('productivityTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold flex items-center gap-2 ${trendColor}`}>
            {productivityTrend === 'improving' ? <ArrowUpRight className="h-5 w-5" /> : productivityTrend === 'declining' ? <ArrowDownRight className="h-5 w-5" /> : <Minus className="h-5 w-5 text-muted-foreground" />}
            {trendLabel}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('riskLevel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-1">
            <Badge variant="outline" className={`text-base px-3 py-1 ${getRiskColor(riskLevel)} border`}>
              {riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
