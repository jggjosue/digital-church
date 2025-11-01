"use client"

import * as React from 'react'
import { HeartHandshake } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { prayerRequests as initialPrayerRequests } from "@/lib/data"
import { ScrollArea } from '@/components/ui/scroll-area'

export function PrayerRequests() {
  const { toast } = useToast()
  const [request, setRequest] = React.useState("")
  const [requests, setRequests] = React.useState(initialPrayerRequests)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (request.trim()) {
      const newRequest = {
        id: requests.length + 1,
        request: request,
        submitted: 'just now'
      };
      setRequests(prev => [newRequest, ...prev]);
      setRequest("")
      toast({
        title: "Request Submitted",
        description: "Thank you for sharing. We will be praying for you.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prayer Wall</CardTitle>
          <HeartHandshake className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          Share your requests and pray for others.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Requests</TabsTrigger>
            <TabsTrigger value="submit">Submit a Request</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <ScrollArea className="h-72 w-full">
              <div className="space-y-4 pr-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-foreground">{req.request}</p>
                    <p className="text-xs text-muted-foreground text-right mt-2">{req.submitted}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="submit">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Type your prayer request here..."
                className="min-h-[150px]"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
              />
              <Button type="submit" className="w-full">Submit Anonymously</Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">Your request will be posted anonymously.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
