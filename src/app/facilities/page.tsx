'use client';

import * as React from 'react';
import {
  Building,
  Plus,
  Search,
  ListFilter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const facilityBookings = [
  { id: 1, title: 'Youth Group', date: '2024-10-03', category: 'green' },
  { id: 2, title: 'Sunday Service', date: '2024-10-06', category: 'yellow' },
  { id: 3, title: 'Sunday Service', date: '2024-10-13', category: 'yellow' },
  { id: 4, title: 'Choir Practice', date: '2024-10-15', category: 'blue' },
  { id: 5, title: 'Sunday Service', date: '2024-10-20', category: 'yellow' },
  { id: 6, title: 'Sunday Service', date: '2024-10-27', category: 'yellow' },
];

const categoryColors: { [key: string]: string } = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export default function FacilitiesPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2024, 9, 1)); // October 2024

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = Array.from({ length: firstDay }, (_, i) => ({
    day: new Date(year, month, i - firstDay + 1).getDate(),
    isCurrentMonth: false,
  }));

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isCurrentMonth: true });
  }

  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  return (
    <main className="flex-1 bg-muted/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facility Management</h1>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">Booking Calendar</TabsTrigger>
            <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
            <TabsTrigger value="resources">Resource Management</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="icon">
                        <ListFilter className="h-4 w-4" />
                     </Button>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search bookings..." className="pl-9" />
                    </div>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Book Room
                  </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h2 className="text-xl font-semibold">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                            <Button variant="ghost" size="sm" className="bg-background shadow-sm">Month</Button>
                            <Button variant="ghost" size="sm">Week</Button>
                            <Button variant="ghost" size="sm">Day</Button>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-px border-t border-l bg-border">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card">
                            {day}
                            </div>
                        ))}
                        {calendarDays.map((date, index) => {
                            const dayBookings = facilityBookings.filter(booking => {
                                const bookingDate = new Date(booking.date);
                                // Adjust for timezone offset to compare dates correctly
                                const adjustedBookingDate = new Date(bookingDate.valueOf() + bookingDate.getTimezoneOffset() * 60 * 1000);
                                return adjustedBookingDate.getFullYear() === year && adjustedBookingDate.getMonth() === month && adjustedBookingDate.getDate() === date.day && date.isCurrentMonth;
                            });

                            return (
                            <div key={index} className={`relative h-24 p-2 bg-card border-r border-b ${date.isCurrentMonth ? '' : 'bg-muted/50 text-muted-foreground'}`}>
                                <div className="text-sm">{date.day}</div>
                                <div className="mt-1 space-y-1">
                                    {dayBookings.map(booking => (
                                        <Badge key={booking.id} variant="outline" className={`p-1 text-xs w-full justify-start ${categoryColors[booking.category]}`}>
                                            {booking.title}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </CardContent>
                </Card>

              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests">
            <div className="p-6 text-center text-muted-foreground">
              Maintenance request management coming soon.
            </div>
          </TabsContent>
          <TabsContent value="resources">
            <div className="p-6 text-center text-muted-foreground">
              Resource management coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}