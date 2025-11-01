import { Church } from "lucide-react";

import { MemberStats } from "@/components/dashboard/member-stats";
import { AttendanceTracking } from "@/components/dashboard/attendance-tracking";
import { GivingTrends } from "@/components/dashboard/giving-trends";
import { VisitorAnalysis } from "@/components/dashboard/visitor-analysis";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { PrayerRequests } from "@/components/dashboard/prayer-requests";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Church className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Churchlytics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MemberStats />
          <AttendanceTracking />
          <GivingTrends />
          <VisitorAnalysis />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <UpcomingEvents />
          </div>
          <PrayerRequests />
        </div>
      </main>
    </div>
  );
}
