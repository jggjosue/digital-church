
'use client';

import * as React from 'react';
import {
  Users,
  Presentation,
  Wind,
  Projector,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { cn } from '@/lib/utils';

const halls = [
    {
      name: 'Sanctuary Hall',
      capacity: 300,
      feature: 'Stage',
      icon: <Presentation className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Community Hall',
      capacity: 150,
      feature: 'AV System',
      icon: <Clapperboard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Prayer Room A',
      capacity: 25,
      feature: 'AC',
      icon: <Wind className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Youth Center',
      capacity: 50,
      feature: 'Projector',
      icon: <Projector className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Library & Study Room',
      capacity: 20,
      feature: 'Wi-Fi',
      icon: <Wifi className="h-4 w-4 text-muted-foreground" />,
    },
  ];
  
  const events = {
    '2023-11-05': [{ title: 'Sunday Service', color: 'bg-red-100 text-red-800' }],
    '2023-11-09': [{ title: 'Youth Group', color: 'bg-green-100 text-green-800' }],
    '2023-11-11': [{ title: 'Wedding Rehearsal', color: 'bg-yellow-100 text-yellow-800' }],
    '2023-11-12': [
      { title: 'Sunday Service', color: 'bg-red-100 text-red-800' },
      { title: 'Wedding Ceremony', color: 'bg-yellow-100 text-yellow-800' },
    ],
    '2023-11-14': [{ title: 'Community Meeting', color: 'bg-blue-100 text-blue-800' }],
    '2023-11-19': [{ title: 'Sunday Service', color: 'bg-red-100 text-red-800' }],
    '2023-11-23': [{ title: 'Thanksgiving Service', color: 'bg-blue-100 text-blue-800' }],
    '2023-11-26': [{ title: 'Sunday Service', color: 'bg-red-100 text-red-800' }],
  };

export default function FacilitiesPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2023, 10, 1)); // November 2023
  const [selectedHall, setSelectedHall] = React.useState(halls[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = Array.from({ length: firstDay }, (_, i) => ({
    day: getDaysInMonth(year, month - 1) - firstDay + i + 1,
    isCurrentMonth: false,
  }));

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isCurrentMonth: true });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  const remainingDays = totalCells - calendarDays.length;

  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Halls & Rooms Management"
        description="Schedule and manage your temple's available spaces."
      >
        <Button>Register Hall</Button>
      </AppHeader>
      <main className="flex-1 flex flex-col md:flex-row min-h-0 bg-muted/20">
        <aside className="w-full md:w-80 border-b md:border-r md:border-b-0 bg-background flex flex-col">
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filter by Hall</h3>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Halls</SelectItem>
                {halls.map(hall => <SelectItem key={hall.name} value={hall.name.toLowerCase().replace(' ', '-')}>{hall.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {halls.map((hall, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 cursor-pointer border-t',
                  selectedHall.name === hall.name ? 'bg-accent' : 'hover:bg-accent/50'
                )}
                onClick={() => setSelectedHall(hall)}
              >
                <h4 className={cn('font-semibold', selectedHall.name === hall.name && 'text-primary')}>{hall.name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Capacity: {hall.capacity}</span>
                  <span className="flex items-center gap-1.5">{hall.icon} {hall.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5" /></Button>
                  <h2 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></Button>
                  <Button variant="outline" onClick={goToToday}>Today</Button>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                    <Button variant="secondary" size="sm">Month</Button>
                    <Button variant="ghost" size="sm">Week</Button>
                    <Button variant="ghost" size="sm">Day</Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-px border-t border-l bg-border">
                {dayNames.map(day => (
                  <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card">{day}</div>
                ))}
                {calendarDays.map((date, index) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                    const dayEvents = date.isCurrentMonth ? events[dateStr as keyof typeof events] : [];
                    return(
                  <div key={index} className={cn("relative h-20 sm:h-28 p-1 sm:p-2 bg-card border-r border-b", date.isCurrentMonth ? '' : 'bg-muted/50 text-muted-foreground/50')}>
                    <div className="text-xs sm:text-sm text-right">{date.day}</div>
                    <div className="mt-1 space-y-1">
                      {dayEvents?.map((event, eventIndex) => (
                        <div key={eventIndex} className={cn("p-1 rounded-md text-[10px] sm:text-xs truncate", event.color)}>
                            {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
