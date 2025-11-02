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

export type TimeRange = 'this-week' | 'this-month' | 'this-quarter' | 'this-year';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('this-week');

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
            <p className="text-muted-foreground">
              Un resumen de las actividades y estadísticas clave de la iglesia.
            </p>
          </div>
          <Tabs
            defaultValue="this-week"
            className="w-full sm:w-auto"
            onValueChange={handleTimeRangeChange}
          >
            <TabsList>
              <TabsTrigger value="this-week">Esta Semana</TabsTrigger>
              <TabsTrigger value="this-month">Este Mes</TabsTrigger>
              <TabsTrigger value="this-quarter">Este Trimestre</TabsTrigger>
              <TabsTrigger value="this-year">Este Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TotalMembers timeRange={timeRange} />
          <WeeklyAttendance timeRange={timeRange} />
          <GivingThisMonth timeRange={timeRange} />
          <UpcomingEventsCard />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TotalGroups />
          <TotalMinistries />
          <TotalVolunteers />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <GivingTrends timeRange={timeRange} />
          </div>
          <div className="lg:col-span-1">
            <MemberDemographics />
          </div>
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              <UpcomingEvents />
              <PrayerRequests />
            </div>
          </div>
        </div>
      </main>
  );
}
