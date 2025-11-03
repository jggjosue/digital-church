'use client';

import * as React from 'react';
import { SendEmailForm } from './send-email-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SendEmailPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex-1 bg-muted/20 p-4 sm:p-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 mt-2" />
            </div>
          </div>
          <Card className="mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </main>
      }
    >
      <SendEmailForm />
    </React.Suspense>
  );
}
