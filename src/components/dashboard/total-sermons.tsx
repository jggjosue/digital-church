'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardStats } from '@/lib/dashboard-stats';
import { BookOpen } from 'lucide-react';

interface TotalSermonsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function TotalSermons({ stats, loading }: TotalSermonsProps) {
  const total = stats?.sermonsPublished ?? 0;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
        <CardTitle className="text-sm font-medium">Sermones Publicados</CardTitle>
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-[1.7rem] font-bold sm:text-2xl">{loading ? '…' : total}</div>
        <p className="text-xs text-muted-foreground">
          {loading ? '…' : `Accesibles a la congregación`}
        </p>
      </CardContent>
    </Card>
  );
}
