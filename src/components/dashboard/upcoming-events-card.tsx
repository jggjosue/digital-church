
"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { upcomingEvents } from "@/lib/data"
import { Calendar } from "lucide-react"

export function UpcomingEventsCard() {
  const totalEvents = upcomingEvents.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalEvents}</div>
        <p className="text-xs text-muted-foreground">Eventos este mes</p>
      </CardContent>
    </Card>
  )
}
