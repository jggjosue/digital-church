"use client"

import { Users } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberDemographics } from "@/lib/data"
import { ChartTooltipContent } from "@/components/ui/chart"

const totalMembers = memberDemographics.reduce((acc, curr) => acc + curr.value, 0)

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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberDemographics} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
