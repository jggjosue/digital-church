
"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { groupData } from "@/lib/data"
import { Users } from 'lucide-react';

const totalGroups = groupData.length;

export function TotalGroups() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalGroups}</div>
        <p className="text-xs text-muted-foreground">{groupData.filter(g => g.status === 'Active').length} active groups</p>
      </CardContent>
    </Card>
  )
}
