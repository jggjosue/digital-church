'use client';

import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DashboardStats } from '@/lib/dashboard-stats';

const chartConfig = {
  '18-25': { label: '18-25', color: 'hsl(252 82% 64%)' },
  '26-40': { label: '26-40', color: 'hsl(217 91% 60%)' },
  '41-60': { label: '41-60', color: 'hsl(45 93% 58%)' },
  '60+': { label: '60+', color: 'hsl(142 71% 45%)' },
};

interface MemberDemographicsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function MemberDemographics({ stats, loading }: MemberDemographicsProps) {
  const demographicsData = stats?.demographics ?? [];
  const totalMembers = demographicsData.reduce((acc, curr) => acc + curr.value, 0);
  const pieData =
    demographicsData.length > 0
      ? demographicsData
      : [{ name: 'Sin datos', value: 1, fill: 'hsl(var(--muted))' }];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demografía de Miembros</CardTitle>
        <CardDescription>Distribución por grupo de edad</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative mx-auto aspect-square h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              {loading ? '…' : totalMembers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Miembros</div>
          </div>
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-x-8 gap-y-2">
          {demographicsData.length > 0 ? (
            demographicsData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span>{d.name}</span>
                <span style={{ color: d.fill }} className="font-bold">
                  {totalMembers > 0
                    ? `${Math.round((d.value / totalMembers) * 100)}%`
                    : '—'}
                </span>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-center text-sm text-muted-foreground">
              Sin datos de edad en miembros.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
