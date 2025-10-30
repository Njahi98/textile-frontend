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
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">{error}</AlertDescription>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </Alert>
  );
};

export default ErrorAlert;
