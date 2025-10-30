import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoadingOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { t } = useTranslation(['aiInsights']);
  if (!visible) return null;
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-md shadow-lg border">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">{t('generatingInsights')}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
