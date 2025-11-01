"use client"

import { HandCoins } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import { ChartTooltipContent } from "@/components/ui/chart"

const lastGiving = givingData[givingData.length - 1]?.total ?? 0
const secondLastGiving = givingData[givingData.length - 2]?.total ?? 0
const trend = ((lastGiving - secondLastGiving) / secondLastGiving) * 100

export function GivingTrends() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Giving Trends</CardTitle>
          <HandCoins className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          An overview of monthly financial giving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${lastGiving.toLocaleString()}</div>
        <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% from last month
        </p>
        <div className="h-[100px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={givingData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGiving" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="total"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGiving)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
