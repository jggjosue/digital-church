"use client"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import type { TimeRange } from '@/app/dashboard/page';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberGrowthData } from "@/lib/data"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MemberGrowthChartProps {
  timeRange: TimeRange;
}

const getFilteredData = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
        case 'this-month':
            return memberGrowthData.slice(-6); // Last 6 months
        case 'this-quarter':
            return memberGrowthData.slice(-3); // Last 3 months for quarter view
        case 'this-year':
            return memberGrowthData; // Full year data
        default:
            return memberGrowthData.slice(-6);
    }
};

const getTitle = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
        case 'this-month':
            return "Últimos 6 Meses";
        case 'this-quarter':
            return "Último Trimestre";
        case 'this-year':
            return "Este Año";
        default:
             return "Últimos 6 Meses";
    }
}


const chartConfig = {
  members: {
    label: "Miembros",
    color: "hsl(var(--primary))",
  },
}

export function MemberGrowthChart({ timeRange }: MemberGrowthChartProps) {
  const filteredData = getFilteredData(timeRange);
  const latestMembers = filteredData[filteredData.length - 1]?.members || 0;

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle>Tendencias de Miembros</CardTitle>
        <CardDescription>{getTitle(timeRange)}</CardDescription>
        <div className="pt-2 text-3xl font-semibold tracking-tight">
          {latestMembers.toLocaleString()}
          <span className="ml-2 text-sm font-normal text-green-600">+2.1%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart accessibilityLayer data={filteredData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
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
  )
}
