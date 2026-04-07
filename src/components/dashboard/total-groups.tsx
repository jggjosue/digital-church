'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardStats } from '@/lib/dashboard-stats';
import { Users } from 'lucide-react';

interface TotalGroupsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function TotalGroups({ stats, loading }: TotalGroupsProps) {
  const total = stats?.groups.totalLabels ?? 0;
  const active = stats?.groups.activeMembershipHint ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Grupos Totales</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '…' : total}</div>
        <p className="text-xs text-muted-foreground">
          {loading ? '…' : `${active} grupos activos`}
        </p>
      </CardContent>
    </Card>
  );
}
