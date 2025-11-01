"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { memberDemographics } from "@/lib/data"

const totalMembers = memberDemographics.reduce((acc, curr) => acc + curr.value, 0)

export function TotalMembers() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
        <p className="text-xs text-green-600">+1.5%</p>
      </CardContent>
    </Card>
  )
}
