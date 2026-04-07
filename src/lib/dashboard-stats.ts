/** Respuesta de `GET /api/dashboard`. */

export type DashboardDemographicSlice = {
  name: string;
  value: number;
  fill: string;
};

export type DashboardChartMonth = {
  month: string;
  total?: number;
  members?: number;
};

export type DashboardUpcomingEvent = {
  id: string;
  title: string;
  dateParts: { month: string; day: string };
  time: string;
  location: string;
  sortKey: string;
};

export type DashboardPrayerItem = {
  id: string;
  request: string;
  submitted: string;
};

export type DashboardStats = {
  members: { total: number; changePct: number | null };
  attendance: { total: number; changePct: number | null };
  giving: { total: number; changePct: number | null };
  eventsThisMonth: number;
  groups: { totalLabels: number; activeMembershipHint: number };
  ministries: number;
  volunteers: number;
  givingByMonth: DashboardChartMonth[];
  membersByMonth: DashboardChartMonth[];
  givingTrendPct: number | null;
  membersTrendPct: number | null;
  demographics: DashboardDemographicSlice[];
  upcomingEvents: DashboardUpcomingEvent[];
  prayerRequests: DashboardPrayerItem[];
};

export type TimeRangeParam = 'this-week' | 'this-month' | 'this-quarter' | 'this-year';

export function formatPctChange(p: number | null): string {
  if (p == null || Number.isNaN(p)) return '—';
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}
