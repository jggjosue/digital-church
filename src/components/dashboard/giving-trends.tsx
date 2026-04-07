'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import type { TimeRange } from '@/app/dashboard/page';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardStats } from '@/lib/dashboard-stats';
import { formatPctChange } from '@/lib/dashboard-stats';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface GivingTrendsProps {
  stats: DashboardStats | null;
  loading: boolean;
  timeRange: TimeRange;
}

const getTitle = (timeRange: TimeRange) => {
  switch (timeRange) {
    case 'this-week':
    case 'this-month':
      return 'Últimos 6 Meses';
    case 'this-quarter':
      return 'Último Trimestre';
    case 'this-year':
      return 'Este Año';
    default:
      return 'Últimos 6 Meses';
  }
};

const chartConfig = {
  total: {
    label: 'Ofrendas',
    color: 'hsl(var(--primary))',
  },
};

export function GivingTrends({ stats, loading, timeRange }: GivingTrendsProps) {
  const rows =
    stats?.givingByMonth.map((m) => ({
      month: m.month,
      total: m.total ?? 0,
    })) ?? [];
  const totalGiving = rows.reduce((acc, r) => acc + r.total, 0);
  const trendPct = stats?.givingTrendPct ?? null;
  const trendPositive = trendPct != null && trendPct >= 0;
  const trendCls =
    trendPct == null ? 'text-muted-foreground' : trendPositive ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle>Tendencias de Ofrendas</CardTitle>
        <CardDescription>{getTitle(timeRange)}</CardDescription>
        <div className="pt-2 text-3xl font-semibold tracking-tight">
          {loading ? (
            '…'
          ) : (
            <>
              ${totalGiving.toLocaleString()}
              <span className={`ml-2 text-sm font-normal ${trendCls}`}>
                {formatPctChange(trendPct)}
              </span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={rows.length > 0 ? rows : [{ month: '—', total: 0 }]}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
