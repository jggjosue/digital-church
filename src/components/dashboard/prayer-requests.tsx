"use client"
import * as React from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prayerRequests as initialPrayerRequests } from "@/lib/data"

export function PrayerRequests() {
  const [requests, setRequests] = React.useState(initialPrayerRequests)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Peticiones de Oración Recientes</CardTitle>
        <Button variant="link" className="p-0 h-auto" asChild>
          <Link href="/prayer">Ver Todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requests.slice(0, 3).map((req) => (
            <div key={req.id} className="p-3 bg-secondary rounded-lg">
              <p className="text-sm font-semibold text-foreground">{req.request}</p>
              <p className="text-xs text-muted-foreground mt-1">{req.submitted}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
