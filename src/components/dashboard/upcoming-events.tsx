import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { upcomingEvents } from "@/lib/data"
import { Button } from "@/components/ui/button"

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Upcoming Events</CardTitle>
        <Button variant="link" className="p-0 h-auto">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {upcomingEvents.slice(0, 4).map((event, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-secondary rounded-md p-2 flex flex-col items-center justify-center h-14 w-14">
                    <span className="text-xs font-bold text-primary">{event.date.split(' ')[0].toUpperCase()}</span>
                    <span className="text-2xl font-bold">{event.date.split(' ')[1].replace(',', '')}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-sm">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.time} - {event.location}</p>
                </div>
              </div>
            ))}
          </div>
      </CardContent>
    </Card>
  )
}
