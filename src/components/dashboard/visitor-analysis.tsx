import { UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function VisitorAnalysis() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Visitors</CardTitle>
          <UserPlus className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          New visitors who joined us this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">42</div>
        <p className="text-xs text-muted-foreground">+18.2% from last month</p>
      </CardContent>
    </Card>
  )
}
