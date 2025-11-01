"use client"

import { BarChart3 } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { attendanceData } from "@/lib/data"
import { ChartTooltipContent } from "@/components/ui/chart"

const lastAttendance = attendanceData[attendanceData.length - 1]?.attendance ?? 0
const secondLastAttendance = attendanceData[attendanceData.length - 2]?.attendance ?? 0
const trend = ((lastAttendance - secondLastAttendance) / secondLastAttendance) * 100

export function AttendanceTracking() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Attendance</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          An overview of weekly church attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{lastAttendance}</div>
        <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% from last week
        </p>
        <div className="h-[100px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={attendanceData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Line
                dataKey="attendance"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
