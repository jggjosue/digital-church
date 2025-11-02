"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { attendanceData } from "@/lib/data"
import type { TimeRange } from '@/app/dashboard/page';

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
            {timeRange === 'this-week' ? 'Asistencia Semanal' : 'Asistencia Total'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
