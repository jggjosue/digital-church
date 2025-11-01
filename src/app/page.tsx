import { Church, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TotalMembers } from "@/components/dashboard/total-members";
import { WeeklyAttendance } from "@/components/dashboard/weekly-attendance";
import { GivingThisMonth } from "@/components/dashboard/giving-this-month";
import { NewVisitors } from "@/components/dashboard/new-visitors";
import { GivingTrends } from "@/components/dashboard/giving-trends";
import { MemberDemographics } from "@/components/dashboard/member-demographics";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { PrayerRequests } from "@/components/dashboard/prayer-requests";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Church className="h-6 w-6 text-primary" />
          <span>ChurchFlow</span>
        </div>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          <a href="#" className="font-bold text-primary">Dashboard</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Members</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Events</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Finances</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Reports</a>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">An overview of key church activities and statistics.</p>
          </div>
          <Tabs defaultValue="this-week" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="this-week">This Week</TabsTrigger>
              <TabsTrigger value="this-month">This Month</TabsTrigger>
              <TabsTrigger value="this-quarter">This Quarter</TabsTrigger>
              <TabsTrigger value="this-year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TotalMembers />
          <WeeklyAttendance />
          <GivingThisMonth />
          <NewVisitors />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <GivingTrends />
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
    </div>
  );
}
