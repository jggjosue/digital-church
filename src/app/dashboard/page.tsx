'use client';
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TotalMembers } from '@/components/dashboard/total-members';
import { WeeklyAttendance } from '@/components/dashboard/weekly-attendance';
import { GivingThisMonth } from '@/components/dashboard/giving-this-month';
import { GivingTrends } from '@/components/dashboard/giving-trends';
import { MemberDemographics } from '@/components/dashboard/member-demographics';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { PrayerRequests } from '@/components/dashboard/prayer-requests';
import { TotalGroups } from '@/components/dashboard/total-groups';
import { TotalMinistries } from '@/components/dashboard/total-ministries';
import { TotalVolunteers } from '@/components/dashboard/total-volunteers';
import { UpcomingEventsCard } from '@/components/dashboard/upcoming-events-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { MemberGrowthChart } from '@/components/dashboard/member-growth-chart';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from '@/components/mobile-sidebar';

export type TimeRange = 'this-week' | 'this-month' | 'this-quarter' | 'this-year';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('this-week');

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  return (
    <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 flex-row items-center justify-between gap-4 border-b bg-background px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="md:hidden">
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="sm:max-w-xs p-0">
                      <MobileSidebar />
                  </SheetContent>
                </Sheet>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panel</h1>
                    <p className="text-sm text-muted-foreground">
                    Un resumen de las actividades y estadísticas clave de la iglesia.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2">
                <Tabs
                    defaultValue="this-week"
                    className="hidden sm:block"
                    onValueChange={handleTimeRangeChange}
                >
                    <TabsList>
                    <TabsTrigger value="this-week">Esta Semana</TabsTrigger>
                    <TabsTrigger value="this-month">Este Mes</TabsTrigger>
                    <TabsTrigger value="this-quarter">Este Trimestre</TabsTrigger>
                    <TabsTrigger value="this-year">Este Año</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
        <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="sm:hidden">
          <Tabs
            defaultValue="this-week"
            className="w-full"
            onValueChange={handleTimeRangeChange}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="this-week">Esta Semana</TabsTrigger>
              <TabsTrigger value="this-month">Este Mes</TabsTrigger>
              <TabsTrigger value="this-quarter">Este Trimestre</TabsTrigger>
              <TabsTrigger value="this-year">Este Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TotalMembers timeRange={timeRange} />
          <WeeklyAttendance timeRange={timeRange} />
          <GivingThisMonth timeRange={timeRange} />
          <UpcomingEventsCard />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <TotalGroups />
          <TotalMinistries />
          <TotalVolunteers />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GivingTrends timeRange={timeRange} />
            <MemberGrowthChart timeRange={timeRange} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <MemberDemographics />
          </div>
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              <UpcomingEvents />
              <PrayerRequests />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
