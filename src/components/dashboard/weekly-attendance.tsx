'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TimeRange } from '@/app/dashboard/page';
import type { DashboardStats } from '@/lib/dashboard-stats';
import { formatPctChange } from '@/lib/dashboard-stats';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

interface WeeklyAttendanceProps {
  stats: DashboardStats | null;
  loading: boolean;
  timeRange: TimeRange;
}

export function WeeklyAttendance({ stats, loading, timeRange }: WeeklyAttendanceProps) {
  const value = stats?.attendance.total ?? 0;
  const pct = stats?.attendance.changePct ?? null;
  const positive = pct != null && pct >= 0;
  const trendCls =
    pct == null ? 'text-muted-foreground' : positive ? 'text-green-600' : 'text-red-600';
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {timeRange === 'this-week' ? 'Asistencia Semanal' : 'Asistencia Total'}
        </CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Activity className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">
          {loading ? '…' : value.toLocaleString()}
        </div>
        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${trendCls}`}>
          {pct != null ? <TrendIcon className="h-3.5 w-3.5" /> : null}
          {formatPctChange(pct)} vs periodo anterior
        </p>
      </CardContent>
    </Card>
  );
}
