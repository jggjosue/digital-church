'use client';

import { Line, LineChart, XAxis, YAxis } from 'recharts';
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

interface MemberGrowthChartProps {
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
  members: {
    label: 'Miembros',
    color: 'hsl(var(--primary))',
  },
};

export function MemberGrowthChart({ stats, loading, timeRange }: MemberGrowthChartProps) {
  const rows =
    stats?.membersByMonth.map((m) => ({
      month: m.month,
      members: m.members ?? 0,
    })) ?? [];
  const latestMembers = rows.length > 0 ? rows[rows.length - 1].members : 0;
  const trendPctWrapper = stats?.membersTrendPct ?? null;
  const trendPositive = trendPctWrapper != null && trendPctWrapper >= 0;
  const trendCls =
    trendPctWrapper == null
      ? 'text-muted-foreground'
      : trendPositive
        ? 'text-green-600'
        : 'text-red-600';

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle>Tendencias de Miembros</CardTitle>
        <CardDescription>{getTitle(timeRange)}</CardDescription>
        <div className="pt-2 text-3xl font-semibold tracking-tight">
          {loading ? (
            '…'
          ) : (
            <>
              {latestMembers.toLocaleString()}
              <span className={`ml-2 text-sm font-normal ${trendCls}`}>
                {formatPctChange(trendPctWrapper)}
              </span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={rows.length > 0 ? rows : [{ month: '—', members: 0 }]}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Line
              dataKey="members"
              type="natural"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
