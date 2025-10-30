
export interface ChartDataItem {
  id?: number;
  date?: string;
  name?: string;
  code?: string;
  location?: string;
  pieces: number;
  errorRate: number;
  timeTaken: number;
  records: number;
  efficiency?: number;
  utilization?: number;
}

export const getErrorRateBadge = (t: (key: string) => string, rate: number) => {
  if (rate < 2) return { variant: 'default' as const, text: t('quality.excellent') };
  if (rate < 5) return { variant: 'secondary' as const, text: t('quality.good') };
  if (rate < 10) return { variant: 'outline' as const, text: t('quality.fair') };
  return { variant: 'destructive' as const, text: t('quality.poor') };
};

export const getDisplayName = (item: ChartDataItem) => {
  return item.date || item.name || 'Unknown';
};

export interface GroupedByDate {
  date: string;
  _sum: { piecesMade: number | null } | null;
  _avg: { errorRate: number | null; timeTaken: number | null } | null;
  _count: number | null;
}

export interface GroupedByWorker {
  workerId: number;
  worker?: { name: string } | null;
  _sum: { piecesMade: number | null } | null;
  _avg: { errorRate: number | null; timeTaken: number | null } | null;
  _count: number | null;
}

export interface GroupedByProduct {
  productId: number;
  product?: { name: string; code: string } | null;
  _sum: { piecesMade: number | null } | null;
  _avg: { errorRate: number | null; timeTaken: number | null } | null;
  _count: number | null;
}

export interface GroupedByProductionLine {
  productionLineId: number;
  productionLine?: { name: string; location: string; capacity: number } | null;
  _sum: { piecesMade: number | null } | null;
  _avg: { errorRate: number | null; timeTaken: number | null } | null;
  _count: number | null;
}