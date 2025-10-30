import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface Recommendation {
  category: 'productivity' | 'quality' | 'efficiency' | 'workforce' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const RecommendationsGrid: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => {
  const { t } = useTranslation(['aiInsights']);
  if (!recommendations?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('aiRecommendations')}</CardTitle>
        <CardDescription>{t('aiRecommendationsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Card key={`${rec.title}-${rec.category}-${rec.priority}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className={`${getPriorityColor(rec.priority)} border`}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                  </Badge>
                </div>
                <h4 className="font-semibold leading-snug">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  <span className="font-medium text-foreground">{t('expectedImpact')}:</span> {rec.impact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsGrid;
