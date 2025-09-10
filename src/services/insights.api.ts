import api from "@/lib/api";

export interface InsightsFilters {
    startDate?: string;
    endDate?: string;
    workerId?: number;
    productionLineId?: number;
    productId?: number;
}

export interface AIInsightResponse {
    success: boolean;
    insights: {
        summary: string;
        recommendations: Array<{
            category: 'productivity' | 'quality' | 'efficiency' | 'workforce' | 'maintenance';
            priority: 'high' | 'medium' | 'low';
            title: string;
            description: string;
            impact: string;
        }>;
        alerts: Array<{
            type: 'warning' | 'critical' | 'info';
            message: string;
            action: string;
        }>;
        kpis: {
            overallEfficiency: number;
            qualityScore: number;
            productivityTrend: 'improving' | 'declining' | 'stable';
            riskLevel: 'low' | 'medium' | 'high';
        };
    };
    dataAnalyzed: {
        dateRange: { startDate: string; endDate: string };
        totalRecords: number;
        workersAnalyzed: number;
        productionLinesAnalyzed: number;
        productsAnalyzed: number;
    };
}

class InsightsAPI {
    async getAIInsights(filters: InsightsFilters = {}): Promise<AIInsightResponse> {
        try {
            const response = await api.get('api/insights/', {
                params: filters
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching AI insights:', error);
            
            // Handle rate limiting specifically - preserve the original error structure
            if (error.response?.status === 429) {
                // Don't transform the error, just re-throw it as-is to preserve the response structure
                throw error;
            }
            
            throw error;
        }
    }
}

export const insightsAPI = new InsightsAPI();
