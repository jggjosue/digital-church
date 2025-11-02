"use client"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { memberDemographics as demographicsData } from "@/lib/data";

const totalMembers = demographicsData.reduce((acc, curr) => acc + curr.value, 0);

const chartConfig = {
  'Niños (0-12)': { label: 'Niños (0-12)', color: 'hsl(var(--chart-1))' },
  'Jóvenes (13-18)': { label: 'Jóvenes (13-18)', color: 'hsl(var(--chart-2))' },
  'Adultos Jóvenes (19-35)': { label: 'Adultos Jóvenes (19-35)', color: 'hsl(var(--chart-3))' },
  'Adultos (36-60)': { label: 'Adultos (36-60)', color: 'hsl(var(--chart-4))' },
  'Adultos Mayores (60+)': { label: 'Adultos Mayores (60+)', color: 'hsl(var(--chart-5))' },
}

export function MemberDemographics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demografía de Miembros</CardTitle>
        <CardDescription>Distribución por grupo de edad</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-[200px] w-full relative">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={demographicsData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
                 {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="text-3xl font-bold">{totalMembers}</div>
             <div className="text-sm text-muted-foreground">Miembros</div>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="w-full">
            <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-mt-4 flex-wrap"
            />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
