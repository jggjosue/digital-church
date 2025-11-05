
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

const eventsForDay = [
    {
        id: 1,
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        category: 'Community Service',
        categoryClass: 'bg-orange-100 text-orange-800 border-orange-200',
        title: 'Community Outreach Program',
        description: "Join us in our monthly effort to support the local community. This month, we'll be organizing a food drive and helping at the local shelter.",
    },
    {
        id: 2,
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        category: 'Youth Ministry',
        categoryClass: 'bg-green-100 text-green-800 border-green-200',
        title: 'Youth Group Meeting',
        description: "A fun and engaging session for teenagers. We'll have games, music, and a short devotional. A great place to build friendships and faith.",
    },
    {
        id: 3,
        startTime: '07:00 PM',
        endTime: '08:00 PM',
        category: 'Worship',
        categoryClass: 'bg-purple-100 text-purple-800 border-purple-200',
        title: 'Mid-week Prayer & Worship Service',
        description: 'A time for reflection, prayer, and worship to refresh your spirit in the middle of the week. Everyone is welcome to join.',
    },
];

export default function ActivitiesPage() {
    const [currentDate, setCurrentDate] = React.useState(new Date('2024-10-09T00:00:00'));

    const handleDateChange = (days: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title={`Events for ${formattedDate}`}
        description={`A total of ${eventsForDay.length} events are scheduled for this day.`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => handleDateChange(-1)} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Day
            </Button>
            <Button variant="ghost" onClick={() => handleDateChange(1)} className="w-full sm:w-auto">
                Next Day
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button asChild className="w-full sm:w-auto">
                <Link href="/events/new">
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Link>
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="space-y-6">
        {eventsForDay.map((event, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0 flex flex-col sm:flex-row">
              <div className="w-full sm:w-28 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-4 bg-muted/50">
                  <p className="text-lg font-bold text-primary">{event.startTime}</p>
                  <div className="h-px w-4 sm:h-full sm:w-px bg-border my-2 mx-2 sm:mx-0"></div>
                  <p className="text-sm text-muted-foreground">{event.endTime}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Badge variant="outline" className={event.categoryClass}>{event.category}</Badge>
                  <h3 className="text-xl font-semibold mt-2">{event.title}</h3>
                  <p className="text-muted-foreground mt-1 max-w-xl">{event.description}</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto mt-4 sm:mt-0" asChild>
                    <Link href={`/events/${event.id}`}>Ver Detalles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
    </div>
  );
}
