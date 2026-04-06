"use client"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { TimeRange } from '@/app/dashboard/page';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GivingTrendsProps {
  timeRange: TimeRange;
}

const getFilteredData = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
        case 'this-month':
            return givingData.slice(-6); // Last 6 months
        case 'this-quarter':
            return givingData.slice(-3); // Last 3 months for quarter view
        case 'this-year':
            return givingData; // Full year data
        default:
            return givingData.slice(-6);
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
  total: {
    label: "Ofrendas",
    color: "hsl(var(--primary))",
  },
}

export function GivingTrends({ timeRange }: GivingTrendsProps) {
  const filteredData = getFilteredData(timeRange);
  const totalGiving = filteredData.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle>Tendencias de Ofrendas</CardTitle>
        <CardDescription>{getTitle(timeRange)}</CardDescription>
        <div className="pt-2 text-3xl font-semibold tracking-tight">
          ${totalGiving.toLocaleString()}
          <span className="ml-2 text-sm font-normal text-green-600">+4.2%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={filteredData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
      </CardContent>
    </Card>
  )
}
