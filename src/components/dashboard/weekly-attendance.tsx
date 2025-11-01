"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { attendanceData } from "@/lib/data"

const lastAttendance = attendanceData[attendanceData.length - 1]?.attendance ?? 0

export function WeeklyAttendance() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{lastAttendance}</div>
        <p className="text-xs text-red-600">-2.1%</p>
      </CardContent>
    </Card>
  )
}
