"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"
import type { TimeRange } from '@/app/dashboard/page';
import { HandCoins, TrendingUp } from 'lucide-react';

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
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Ofrendas</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <HandCoins className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}</div>
        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          {change} vs periodo anterior
        </p>
      </CardContent>
    </Card>
  )
}
