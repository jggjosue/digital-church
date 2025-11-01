"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import type { TimeRange } from '@/app/page';

interface GivingThisMonthProps {
  timeRange: TimeRange;
}

const getDataForRange = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week':
            // Assuming weekly giving is a fraction of monthly for demo
            return { value: givingData[givingData.length - 1].total / 4, change: '+5.8%' };
        case 'this-month':
            return { value: givingData[givingData.length - 1].total, change: '+5.8%' };
        case 'this-quarter':
            const quarterData = givingData.slice(-3);
            const quarterTotal = quarterData.reduce((acc, curr) => acc + curr.total, 0);
            return { value: quarterTotal, change: '+11.2%' };
        case 'this-year':
            const yearTotal = givingData.reduce((acc, curr) => acc + curr.total, 0);
            return { value: yearTotal, change: '+20.1%' };
        default:
            return { value: 0, change: '0%' };
    }
};

export function GivingThisMonth({ timeRange }: GivingThisMonthProps) {
  const { value, change } = getDataForRange(timeRange);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Giving</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}</div>
        <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
