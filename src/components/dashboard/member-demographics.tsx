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
  '18-25': { label: '18-25', color: 'hsl(252 82% 64%)' },
  '26-40': { label: '26-40', color: 'hsl(217 91% 60%)' },
  '41-60': { label: '41-60', color: 'hsl(45 93% 58%)' },
  '60+': { label: '60+', color: 'hsl(142 71% 45%)' },
}

export function MemberDemographics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demografía de Miembros</CardTitle>
        <CardDescription>Distribución por grupo de edad</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ChartContainer
            config={chartConfig}
            className="relative mx-auto aspect-square h-[200px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={demographicsData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
                 {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="text-3xl font-bold">{totalMembers}</div>
             <div className="text-sm text-muted-foreground">Miembros</div>
          </div>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="w-full">
             <ChartLegend
                content={
                    <ChartLegendContent 
                        nameKey="name"
                        className="grid grid-cols-2 gap-x-8 gap-y-2"
                        formatter={(value, entry) => {
                            const item = demographicsData.find(d => d.name === value);
                            const percentage = item ? Math.round((item.value / totalMembers) * 100) : 0;
                            return (
                                <div className="flex items-center gap-2 text-sm">
                                    <span>{value}</span>
                                    <span style={{ color: item?.fill }} className="font-bold">{percentage}%</span>
                                </div>
                            )
                        }}
                    />
                }
            />
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
