"use client"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const totalGiving = givingData.reduce((acc, curr) => acc + curr.total, 0)
const chartConfig = {
  total: {
    label: "Giving",
    color: "hsl(var(--primary))",
  },
}

export function GivingTrends() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Giving Trends</CardTitle>
        <CardDescription>Last 6 Months</CardDescription>
        <div className="text-3xl font-bold">${totalGiving.toLocaleString()} <span className="text-sm font-normal text-green-600">+4.2%</span></div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={givingData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
