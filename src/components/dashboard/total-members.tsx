"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberDemographics } from "@/lib/data"
import type { TimeRange } from '@/app/dashboard/page';
import { UsersRound, TrendingUp } from 'lucide-react';

interface TotalMembersProps {
    timeRange: TimeRange;
}

const totalMembers = memberDemographics.reduce((acc, curr) => acc + curr.value, 0)

// This is a simplified calculation for demonstration
const getPercentageChange = (timeRange: TimeRange) => {
    switch (timeRange) {
        case 'this-week': return '+1.5%';
        case 'this-month': return '+3.2%';
        case 'this-quarter': return '+5.8%';
        case 'this-year': return '+12.1%';
        default: return '+1.5%';
    }
};

export function TotalMembers({ timeRange }: TotalMembersProps) {
    const percentageChange = getPercentageChange(timeRange);
  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Miembros Totales</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <UsersRound className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{totalMembers.toLocaleString()}</div>
        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${percentageChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          {percentageChange} vs periodo anterior
        </p>
      </CardContent>
    </Card>
  )
}
