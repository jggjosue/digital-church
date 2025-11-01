"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import type { TimeRange } from '@/app/page';


interface NewVisitorsProps {
    timeRange: TimeRange;
}

const getDataForRange = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
             // Assuming weekly visitors is a fraction of monthly for demo
            return { value: Math.round(givingData[givingData.length - 1].newVisitors / 4), change: '+12%' };
        case 'this-month':
            return { value: givingData[givingData.length - 1].newVisitors, change: '+12%' };
        case 'this-quarter':
            const quarterData = givingData.slice(-3);
            const quarterTotal = quarterData.reduce((acc, curr) => acc + curr.newVisitors, 0);
            return { value: quarterTotal, change: '+18%' };
        case 'this-year':
            const yearTotal = givingData.reduce((acc, curr) => acc + curr.newVisitors, 0);
            return { value: yearTotal, change: '+25%' };
        default:
            return { value: 0, change: '0%' };
    }
};

export function NewVisitors({ timeRange }: NewVisitorsProps) {
  const { value, change } = getDataForRange(timeRange);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
