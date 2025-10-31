import api from "@/lib/api";
import axios from "axios";

export interface InsightsFilters {
    startDate?: string;
    endDate?: string;
    workerId?: number;
    productionLineId?: number;
    productId?: number;
}

export interface AIInsightResponse {
    success: boolean;
    message:string;
    insights: {
        summary: string;
        recommendations: {
            category: 'productivity' | 'quality' | 'efficiency' | 'workforce' | 'maintenance';
            priority: 'high' | 'medium' | 'low';
            title: string;
            description: string;
            impact: string;
        }[];
        alerts: {
            type: 'warning' | 'critical' | 'info';
            message: string;
            action: string;
        }[];
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
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            
               if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw error;
        }
      }
            
            throw error;
        }
    }
}

export const insightsAPI = new InsightsAPI();
