import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NoDataState: React.FC<{ onGenerate: () => void; hasFilters: boolean }> = ({ onGenerate, hasFilters }) => {
  const { t } = useTranslation(['aiInsights']);
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-md bg-muted p-6 mb-4">
          <FileX className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl font-semibold text-center mb-2">
          {t('noDataTitle')}
        </CardTitle>
        <p className="text-center max-w-md mb-4 text-sm text-muted-foreground">
          {hasFilters ? t('noDataDescriptionWithFilters') : t('noDataDescriptionNoFilters')}
        </p>
        {hasFilters && (
          <Button onClick={onGenerate} className="mt-2">
            <PlayCircle className="h-4 w-4 mr-2" />
            {t('generateReport')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NoDataState;
