"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { attendanceData } from "@/lib/data"
import type { TimeRange } from '@/app/dashboard/page';
import { Activity, TrendingUp } from 'lucide-react';

interface WeeklyAttendanceProps {
  timeRange: TimeRange;
}

const getDataForRange = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
            return { value: attendanceData[attendanceData.length - 1]?.attendance ?? 0, change: '-2.1%' };
        case 'this-month':
            const monthData = attendanceData.slice(-4);
            const monthTotal = monthData.reduce((acc, curr) => acc + curr.attendance, 0);
            return { value: monthTotal, change: '+4.5%' };
        case 'this-quarter':
             const quarterData = attendanceData.slice(-12);
             const quarterTotal = quarterData.reduce((acc, curr) => acc + curr.attendance, 0);
            return { value: quarterTotal, change: '+8.2%' };
        case 'this-year':
            const yearTotal = attendanceData.reduce((acc, curr) => acc + curr.attendance, 0);
            return { value: yearTotal, change: '+15.3%' };
        default:
            return { value: 0, change: '0%' };
    }
};

export function WeeklyAttendance({ timeRange }: WeeklyAttendanceProps) {
  const { value, change } = getDataForRange(timeRange);

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
            {timeRange === 'this-week' ? 'Asistencia Semanal' : 'Asistencia Total'}
        </CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Activity className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</div>
        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          {change} vs periodo anterior
        </p>
      </CardContent>
    </Card>
  )
}
