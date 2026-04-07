'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardStats } from '@/lib/dashboard-stats';
import { Church } from 'lucide-react';

interface TotalMinistriesProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function TotalMinistries({ stats, loading }: TotalMinistriesProps) {
  const total = stats?.ministries ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Ministerios Totales</CardTitle>
        <Church className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '…' : total}</div>
        <p className="text-xs text-muted-foreground">Ministerios activos de la iglesia</p>
      </CardContent>
    </Card>
  );
}
