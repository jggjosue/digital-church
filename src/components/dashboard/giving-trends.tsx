"use client"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { TimeRange } from '@/app/page';

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
            return "Last 6 Months";
        case 'this-quarter':
            return "Last Quarter";
        case 'this-year':
            return "This Year";
        default:
             return "Last 6 Months";
    }
}


const chartConfig = {
  total: {
    label: "Giving",
    color: "hsl(var(--primary))",
  },
}

export function GivingTrends({ timeRange }: GivingTrendsProps) {
  const filteredData = getFilteredData(timeRange);
  const totalGiving = filteredData.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Giving Trends</CardTitle>
        <CardDescription>{getTitle(timeRange)}</CardDescription>
        <div className="text-3xl font-bold">${totalGiving.toLocaleString()} <span className="text-sm font-normal text-green-600">+4.2%</span></div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={filteredData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
