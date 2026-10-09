'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('StockPilot Client Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="rounded-full bg-destructive/10 p-4 mb-4 text-destructive">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground mb-6">
        {error.message || 'An unexpected error occurred while loading this section.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
      </div>
    </div>
  );
}
