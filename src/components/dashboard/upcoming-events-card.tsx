
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
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Calendar className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{totalEvents}</div>
        <p className="mt-1 text-xs text-muted-foreground">Eventos programados este mes</p>
      </CardContent>
    </Card>
  )
}
