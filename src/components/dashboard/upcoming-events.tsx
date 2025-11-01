import { Calendar, MapPin } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { upcomingEvents } from "@/lib/data"
import { ScrollArea } from "../ui/scroll-area"

export function UpcomingEvents() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Stay updated with what's happening in our community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px]">
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 text-primary rounded-md p-2 flex flex-col items-center justify-center h-16 w-16">
                    <span className="text-sm font-bold">{event.date.split(' ')[0]}</span>
                    <span className="text-2xl font-bold">{event.date.split(' ')[1].replace(',', '')}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1.5" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
