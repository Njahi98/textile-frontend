import { AIInsightResponse } from '@/services/insights.api';

export interface PersistedInsightDataLike {
  insights: AIInsightResponse['insights'];
  dataAnalyzed: AIInsightResponse['dataAnalyzed'];
}

export function buildAiInsightsCsv(t: (k: string) => string, persisted: PersistedInsightDataLike): string {
  const insights = persisted.insights;
  const dataAnalyzed = persisted.dataAnalyzed;
  const csvContent: string[] = [];

  const addSectionHeader = (title: string, description?: string) => {
    csvContent.push(`"**${title}**"`);
    if (description) csvContent.push(`"${description}"`);
    csvContent.push('');
  };

  const escapeCSV = (content: string) => `"${content.replace(/"/g, '""')}"`;

  csvContent.push(`"${t('aiInsightsReport')} - ${t('generatedOn')} ${new Date().toLocaleDateString()}"`);
  csvContent.push('');

  if (dataAnalyzed) {
    addSectionHeader(t('dataAnalysisSummary'));
    csvContent.push(`"${t('records')}: **${dataAnalyzed.totalRecords}**"`);
    csvContent.push(`"${t('workers')}: **${dataAnalyzed.workersAnalyzed}**"`);
    csvContent.push(`"${t('productionLines')}: **${dataAnalyzed.productionLinesAnalyzed}**"`);
    csvContent.push(`"${t('products')}: **${dataAnalyzed.productsAnalyzed}**"`);
    if (dataAnalyzed.dateRange) {
      csvContent.push(`"Date Range: ${dataAnalyzed.dateRange.startDate} to ${dataAnalyzed.dateRange.endDate}"`);
    }
    csvContent.push('');
  }

  addSectionHeader(t('keyPerformanceIndicators'));
  csvContent.push(`"**${t('overallEfficiency')}**"`);
  csvContent.push(`"**${insights.kpis.overallEfficiency.toFixed(1)}%**"`);
  csvContent.push(`"**${t('qualityScore')}**"`);
  csvContent.push(`"**${insights.kpis.qualityScore.toFixed(1)}%**"`);
  csvContent.push(`"**${t('productivityTrend')}**"`);
  csvContent.push(`"**${insights.kpis.productivityTrend.charAt(0).toUpperCase() + insights.kpis.productivityTrend.slice(1)}**"`);
  csvContent.push(`"**${t('riskLevel')}**"`);
  csvContent.push(`"**${insights.kpis.riskLevel.toUpperCase()}**"`);
  csvContent.push('');

  addSectionHeader(t('executiveSummary'), t('executiveSummaryDescription'));
  const summaryLines = insights.summary.match(/.{1,80}(?:\s|$)/g) || [insights.summary];
  summaryLines.forEach(line => csvContent.push(escapeCSV(line.trim())));
  csvContent.push('');

  if (insights.alerts && insights.alerts.length > 0) {
    addSectionHeader(t('criticalAlerts'), t('criticalAlertsDescription'));
    insights.alerts.forEach((alert, index) => {
      const alertType = alert.type.charAt(0).toUpperCase() + alert.type.slice(1);
      csvContent.push(`"**${alertType} Alert**"`);
      csvContent.push(escapeCSV(alert.message));
      csvContent.push(`"**Recommended Action:** ${alert.action}"`);
      if (index < insights.alerts.length - 1) csvContent.push('');
    });
    csvContent.push('');
  }

  if (insights.recommendations && insights.recommendations.length > 0) {
    addSectionHeader(t('aiRecommendations'), t('aiRecommendationsDescription'));
    insights.recommendations.forEach((rec, index) => {
      const priority = rec.priority.toUpperCase();
      const category = rec.category.charAt(0).toUpperCase() + rec.category.slice(1);
      csvContent.push(`"**${priority}** **${category}**"`);
      csvContent.push(`"**${rec.title}**"`);
      csvContent.push(escapeCSV(rec.description));
      csvContent.push(`"**${t('expectedImpact')}:** ${rec.impact}"`);
      if (index < insights.recommendations.length - 1) csvContent.push('');
    });
  }

  csvContent.push('');
  csvContent.push('');
  csvContent.push(`"${t('reportExportedOn')} ${new Date().toLocaleString()}"`);
  csvContent.push(`"${t('generatedBy')}"`);

  return csvContent.join('\n');
}
