import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: string | null;
  onRetry?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry }) => {
  if (!error) return null;
  return (
    <Alert variant="destructive" className="px-4 py-3">
      <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-sm whitespace-nowrap">{error}</AlertDescription>
      </div>
      {onRetry && (
        <Button
        onClick={onRetry}
        variant="outline"
        size="default"
        className="ml-4 px-3 py-1.5 h-9 flex items-center"
        >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span className="whitespace-nowrap">Retry</span>
        </Button>
      )}
      </div>
    </Alert>
  );
};

export default ErrorAlert;
