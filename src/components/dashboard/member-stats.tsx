"use client"

import { Users } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberDemographics } from "@/lib/data"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const totalMembers = memberDemographics.reduce((acc, curr) => acc + curr.value, 0)
const chartConfig = {
  value: {
    label: "Members",
    color: "hsl(var(--chart-1))",
  },
  'Children (0-12)': { label: 'Children (0-12)', color: 'hsl(var(--chart-1))' },
  'Youth (13-18)': { label: 'Youth (13-18)', color: 'hsl(var(--chart-2))' },
  'Young Adults (19-35)': { label: 'Young Adults (19-35)', color: 'hsl(var(--chart-3))' },
  'Adults (36-60)': { label: 'Adults (36-60)', color: 'hsl(var(--chart-4))' },
  'Seniors (60+)': { label: 'Seniors (60+)', color: 'hsl(var(--chart-5))' },
}

export function MemberStats() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Total Members</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          An overview of member demographics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">+2.1% from last month</p>
        <div className="h-[100px] w-full mt-4">
          <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
            <BarChart accessibilityLayer data={memberDemographics} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                nameKey="name"
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
