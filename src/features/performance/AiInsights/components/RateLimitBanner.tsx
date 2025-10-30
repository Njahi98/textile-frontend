import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RateLimitBannerProps {
  isVisible: boolean;
  cooldownText: string;
  canQuickExport: boolean;
  onExport: () => void;
}

const RateLimitBanner: React.FC<RateLimitBannerProps> = ({ isVisible, canQuickExport, onExport }) => {
  const { t } = useTranslation(['aiInsights']);
  if (!isVisible) return null;
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">{t('rateLimitActive')}</h3>
            <p className="text-sm text-amber-700 mt-1">{t('rateLimitMessage')}</p>
            {canQuickExport && (
              <div className="mt-2 p-2 bg-amber-100 rounded-md">
                <p className="text-xs text-amber-800 font-medium">💡 {t('exportReminder')}</p>
              </div>
            )}
          </div>
          {canQuickExport && (
            <Button size="sm" variant="outline" onClick={onExport} className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
              <Download className="h-3 w-3 mr-1" />
              {t('export')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RateLimitBanner;
