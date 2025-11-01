"use client"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const memberDemographics = [
  { name: '18-25', value: 35, fill: 'var(--color-chart-2)' },
  { name: '26-40', value: 25, fill: 'var(--color-chart-1)' },
  { name: '41-60', value: 20, fill: 'var(--color-chart-3)' },
  { name: '60+', value: 20, fill: 'var(--color-chart-4)' },
]
const totalMembers = 1204;

const chartConfig = {
  '18-25': { label: '18-25', color: 'hsl(var(--chart-2))' },
  '26-40': { label: '26-40', color: 'hsl(var(--chart-1))' },
  '41-60': { label: '41-60', color: 'hsl(var(--chart-3))' },
  '60+': { label: '60+', color: 'hsl(var(--chart-4))' },
}

export function MemberDemographics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Member Demographics</CardTitle>
        <CardDescription>Distribution by age group</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-[200px] w-full relative">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <PieChart>
              <Pie data={memberDemographics} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
                 {memberDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="text-3xl font-bold">{totalMembers}</div>
             <div className="text-sm text-muted-foreground">Members</div>
          </div>
        </div>
        <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            className="-mt-4 flex-wrap"
          />
      </CardContent>
    </Card>
  )
}
