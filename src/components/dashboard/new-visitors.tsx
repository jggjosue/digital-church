"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function NewVisitors() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">23</div>
        <p className="text-xs text-green-600">+12%</p>
      </CardContent>
    </Card>
  )
}
