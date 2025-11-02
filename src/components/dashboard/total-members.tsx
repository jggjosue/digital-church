"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberDemographics } from "@/lib/data"
import type { TimeRange } from '@/app/dashboard/page';

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Miembros Totales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
        <p className={`text-xs ${percentageChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{percentageChange}</p>
      </CardContent>
    </Card>
  )
}
