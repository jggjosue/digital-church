"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { givingData } from "@/lib/data"

const lastGiving = givingData[givingData.length - 1]?.total ?? 0

export function GivingThisMonth() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Giving This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${lastGiving.toLocaleString()}</div>
        <p className="text-xs text-green-600">+5.8%</p>
      </CardContent>
    </Card>
  )
}
