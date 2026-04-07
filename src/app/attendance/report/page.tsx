'use client';

import * as React from 'react';
import {
  CalendarDays,
  Download,
  TrendingUp,
  Smile,
  Users,
  UserRoundPlus,
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type ChurchDoc = {
  id: string;
  name: string;
};

type AttendanceRecord = {
  id: string;
  createdAt: string;
  eventType: 'service' | 'event';
  attendanceMode: 'presencial' | 'online';
};

type ChurchWithRecords = {
  id: string;
  name: string;
  records: AttendanceRecord[];
};

type MonthKey =
  | 'enero'
  | 'febrero'
  | 'marzo'
  | 'abril'
  | 'mayo'
  | 'junio'
  | 'julio'
  | 'agosto'
  | 'septiembre'
  | 'octubre'
  | 'noviembre'
  | 'diciembre';

type CategoryRecord = {
  id: string;
  label: string;
  weeks: number[][];
};

type MonthRecord = {
  month: string;
  period: string;
  categories: CategoryRecord[];
};

type AttendanceRegistryRecord = {
  churchId: string;
  churchName: string;
  year: string;
  records: Record<MonthKey, MonthRecord>;
  initializedMonths: MonthKey[];
};

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, index) => (2020 + index).toString());
const MONTH_ORDER: MonthKey[] = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const monthlyChartConfig = {
  asistencia: {
    label: 'Asistencia',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  asistencia: {
    label: 'Asistencia',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
const fullMonthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

const toMonthLabel = (date: Date) => {
  const label = monthFormatter.format(date);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const normalizeString = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

type AutoTableDoc = jsPDF & {
  autoTable: (options: {
    head: string[][];
    body: Array<Array<string | number>>;
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: Record<string, unknown>;
    styles?: Record<string, unknown>;
  }) => void;
  lastAutoTable?: {
    finalY: number;
  };
};

export default function AttendanceReportPage() {
  const currentYear = new Date().getFullYear().toString();
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [churches, setChurches] = React.useState<ChurchWithRecords[]>([]);
  const [selectedChurchId, setSelectedChurchId] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>(
    YEAR_OPTIONS.includes(currentYear) ? currentYear : YEAR_OPTIONS[0]
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [registryState, setRegistryState] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [registryRecord, setRegistryRecord] = React.useState<AttendanceRegistryRecord | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoadState('loading');
      setErrorMessage(null);
      try {
        const churchesRes = await fetch('/api/churches', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const churchesJson = (await churchesRes.json().catch(() => ({}))) as {
          churches?: ChurchDoc[];
          error?: string;
        };
        if (!churchesRes.ok) {
          throw new Error(churchesJson.error || 'No se pudieron cargar los templos.');
        }

        const churchesList = churchesJson.churches ?? [];
        const recordsByChurch = await Promise.all(
          churchesList.map(async (church) => {
            const recordsRes = await fetch(`/api/churches/${encodeURIComponent(church.id)}/attendance`, {
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            });
            const recordsJson = (await recordsRes.json().catch(() => ({}))) as {
              records?: AttendanceRecord[];
            };
            return {
              id: church.id,
              name: church.name,
              records: recordsRes.ok ? (recordsJson.records ?? []) : [],
            } as ChurchWithRecords;
          })
        );

        const filtered = recordsByChurch
          .filter((church) => church.records.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setChurches(filtered);
        setSelectedChurchId(filtered[0]?.id ?? '');
        setLoadState('ready');
      } catch (e) {
        setLoadState('error');
        setErrorMessage(e instanceof Error ? e.message : 'Error al cargar el reporte.');
      }
    };
    void load();
  }, []);

  const selectedChurch = React.useMemo(
    () => churches.find((church) => church.id === selectedChurchId) ?? null,
    [churches, selectedChurchId]
  );

  React.useEffect(() => {
    const loadRegistry = async () => {
      if (!selectedChurchId) {
        setRegistryRecord(null);
        setRegistryState('idle');
        return;
      }
      setRegistryState('loading');
      try {
        const response = await fetch(
          `/api/attendance/registro?churchId=${encodeURIComponent(selectedChurchId)}&year=${encodeURIComponent(selectedYear)}`,
          {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          }
        );
        const json = (await response.json().catch(() => ({}))) as {
          record?: AttendanceRegistryRecord | null;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error || 'No se pudo cargar el registro anual de asistencia.');
        }
        setRegistryRecord(json.record ?? null);
        setRegistryState('ready');
      } catch (_e) {
        setRegistryRecord(null);
        setRegistryState('error');
      }
    };
    void loadRegistry();
  }, [selectedChurchId, selectedYear]);

  const monthlyChartData = React.useMemo(() => {
    if (!registryRecord) return [] as Array<{ label: string; month: string; asistencia: number }>;

    return MONTH_ORDER.map((monthKey) => {
      const monthData = registryRecord.records[monthKey];
      const monthLabel = toMonthLabel(new Date(Number(selectedYear), MONTH_ORDER.indexOf(monthKey), 1));
      if (!monthData) {
        return { label: monthLabel, month: monthLabel, asistencia: 0 };
      }
      const monthTotal = monthData.categories.reduce((sum, category) => {
        return (
          sum +
          category.weeks.reduce(
            (weekSum, days) =>
              weekSum + days.reduce((daySum, dayValue) => daySum + (Number.isFinite(dayValue) ? dayValue : 0), 0),
            0
          )
        );
      }, 0);
      return {
        label: monthLabel,
        month: monthLabel,
        asistencia: monthTotal,
      };
    });
  }, [registryRecord, selectedYear]);

  const yearlyAttendanceTotal = React.useMemo(
    () => monthlyChartData.reduce((sum, item) => sum + item.asistencia, 0),
    [monthlyChartData]
  );

  const categoryChartData = React.useMemo(() => {
    if (!registryRecord) return [] as Array<{ label: string; asistencia: number }>;

    const totalsByCategory = new Map<string, { label: string; asistencia: number }>();
    for (const monthKey of MONTH_ORDER) {
      const monthData = registryRecord.records[monthKey];
      if (!monthData) continue;
      for (const category of monthData.categories) {
        const key = normalizeString(category.label) || category.id;
        const current = totalsByCategory.get(key) ?? { label: category.label, asistencia: 0 };
        const categoryTotal = category.weeks.reduce(
          (weekSum, days) =>
            weekSum + days.reduce((daySum, dayValue) => daySum + (Number.isFinite(dayValue) ? dayValue : 0), 0),
          0
        );
        current.asistencia += categoryTotal;
        totalsByCategory.set(key, current);
      }
    }

    return Array.from(totalsByCategory.values()).sort((a, b) => b.asistencia - a.asistencia);
  }, [registryRecord]);

  const handleDownloadPdf = () => {
    if (!selectedChurch) return;

    const doc = new jsPDF() as AutoTableDoc;
    const generatedAt = new Date().toLocaleString('es-ES');
    const monthlyRows = monthlyChartData.map((item) => [item.month, item.asistencia]);
    const categoryRows = categoryChartData.map((item) => [item.label, item.asistencia]);
    const semesterRows = stats.monthlyRows.map((row) => [
      row.month,
      row.attendanceCount,
      row.peak,
      row.trend === 'up' ? '↗' : row.trend === 'down' ? '↘' : '→',
    ]);
    const growthRows = stats.monthlyRows.map((row) => [
      row.month,
      row.attendanceCount,
      row.trend === 'up' ? '↗ Subiendo' : row.trend === 'down' ? '↘ Bajando' : '→ Estable',
    ]);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Reporte de Asistencia Mensual', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Templo: ${selectedChurch.name}`, 14, 26);
    doc.text(`Año: ${selectedYear}`, 14, 32);
    doc.text(`Rango de eventos: ${stats.dateLabel}`, 14, 38);
    doc.text(`Generado: ${generatedAt}`, 14, 44);

    doc.autoTable({
      head: [['Resumen general', 'Cantidad']],
      body: [
        ['Servicios', stats.serviceCount],
        ['Eventos', stats.eventCount],
        ['Presencial', stats.presencialCount],
        ['Online', stats.onlineCount],
        ['Total anual de asistencia', yearlyAttendanceTotal || stats.total],
      ],
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
    });

    const firstTableEnd = doc.lastAutoTable?.finalY ?? 60;
    doc.autoTable({
      head: [['La asistencia mensual', 'Cantidad de asistencia']],
      body: monthlyRows,
      startY: firstTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    const secondTableEnd = doc.lastAutoTable?.finalY ?? firstTableEnd + 16;
    doc.autoTable({
      head: [[`Asistencia por categoría (${selectedYear})`, 'Cantidad de asistencia']],
      body: categoryRows.length > 0 ? categoryRows : [['Sin datos', 0]],
      startY: secondTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
    });

    const thirdTableEnd = doc.lastAutoTable?.finalY ?? secondTableEnd + 16;
    doc.autoTable({
      head: [['Historial semestral', 'Cantidad de asistencia', 'Pico', 'Tendencia']],
      body: [...semesterRows, ['Total', stats.semesterAttendanceTotal, '-', '-']],
      startY: thirdTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
    });

    const fourthTableEnd = doc.lastAutoTable?.finalY ?? thirdTableEnd + 16;
    doc.autoTable({
      head: [['Crecimiento mensual', 'Cantidad de asistencia', 'Comportamiento']],
      body: growthRows.length > 0 ? growthRows : [['Sin datos', 0, '→ Estable']],
      startY: fourthTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 10 },
    });

    const churchFileName = selectedChurch.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    doc.save(`reporte-asistencia-${selectedYear}-${churchFileName || 'templo'}.pdf`);
  };

  const stats = React.useMemo(() => {
    const records = selectedChurch?.records ?? [];
    if (records.length === 0) {
      return {
        total: 0,
        serviceCount: 0,
        eventCount: 0,
        presencialCount: 0,
        onlineCount: 0,
        dateLabel: 'Sin datos',
        barHeights: new Array(12).fill(8),
        monthlyRows: [] as Array<{
          month: string;
          attendanceCount: number;
          peak: number;
          trend: 'up' | 'down' | 'flat';
        }>,
        semesterAttendanceTotal: 0,
        growthBars: [8, 8, 8, 8, 8, 8],
      };
    }

    const parsedDates = records
      .map((record) => new Date(record.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstDate = parsedDates[0];
    const lastDate = parsedDates[parsedDates.length - 1];
    const dateLabel = `${fullMonthFormatter.format(firstDate)} - ${fullMonthFormatter.format(lastDate)}`;

    const serviceCount = records.filter((record) => record.eventType === 'service').length;
    const eventCount = records.length - serviceCount;
    const presencialCount = records.filter((record) => record.attendanceMode === 'presencial').length;
    const onlineCount = records.length - presencialCount;

    const monthBuckets = new Map<string, number>();
    const monthDayPeak = new Map<string, Map<string, number>>();

    for (const record of records) {
      const date = new Date(record.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);

      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;
      const dayBucket = monthDayPeak.get(key) ?? new Map<string, number>();
      dayBucket.set(dayKey, (dayBucket.get(dayKey) ?? 0) + 1);
      monthDayPeak.set(key, dayBucket);
    }

    const now = new Date();
    const last12Keys = Array.from({ length: 12 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const last12Values = last12Keys.map((key) => monthBuckets.get(key) ?? 0);
    const max12 = Math.max(...last12Values, 1);
    const barHeights = last12Values.map((value) => 8 + Math.round((value / max12) * 96));

    const last6Keys = last12Keys.slice(-6);
    const monthlyRows = last6Keys.map((key, idx) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const attendanceCount = monthBuckets.get(key) ?? 0;
      const peak = Math.max(...Array.from((monthDayPeak.get(key) ?? new Map()).values()), 0);
      const prev = idx > 0 ? monthBuckets.get(last6Keys[idx - 1]) ?? 0 : attendanceCount;
      const trend: 'up' | 'down' | 'flat' =
        attendanceCount > prev ? 'up' : attendanceCount < prev ? 'down' : 'flat';
      return {
        month: toMonthLabel(date),
        attendanceCount,
        peak,
        trend,
      };
    });
    const semesterAttendanceTotal = monthlyRows.reduce((sum, row) => sum + row.attendanceCount, 0);

    const growthValues = last6Keys.map((key) => monthBuckets.get(key) ?? 0);
    const max6 = Math.max(...growthValues, 1);
    const growthBars = growthValues.map((value) => 8 + Math.round((value / max6) * 140));

    return {
      total: records.length,
      serviceCount,
      eventCount,
      presencialCount,
      onlineCount,
      dateLabel,
      barHeights,
      monthlyRows,
      semesterAttendanceTotal,
      growthBars,
    };
  }, [selectedChurch]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Reporte de Asistencia Mensual"
        description={
          selectedChurch
            ? `${selectedChurch.name} - resumen de servicios y eventos.`
            : 'Seleccione un templo para ver su resumen.'
        }
      >
        <div className="flex items-center gap-2">
          <Select
            value={selectedChurchId}
            onValueChange={setSelectedChurchId}
            disabled={loadState !== 'ready' || churches.length === 0}
          >
            <SelectTrigger className="w-[240px] bg-background">
              <SelectValue placeholder="Seleccione templo" />
            </SelectTrigger>
            <SelectContent>
              {churches.map((church) => (
                <SelectItem key={church.id} value={church.id}>
                  {church.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            disabled={loadState !== 'ready' || churches.length === 0}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <CalendarDays className="mr-2 h-4 w-4" />
            {stats.dateLabel}
          </Button>
          <Button disabled={!selectedChurch} onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">
        {loadState === 'loading' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : null}

        {loadState === 'error' ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              {errorMessage ?? 'No se pudo cargar el reporte.'}
            </CardContent>
          </Card>
        ) : null}

        {loadState === 'ready' && !selectedChurch ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No hay templos con al menos un evento registrado.
            </CardContent>
          </Card>
        ) : null}

        {loadState === 'ready' && selectedChurch ? (
          <>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Servicios</p>
                <p className="text-4xl font-bold">{stats.serviceCount}</p>
                <p className="mt-2 text-sm text-emerald-600">Con asistencia registrada</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Smile className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Eventos</p>
                <p className="text-4xl font-bold">{stats.eventCount}</p>
                <p className="mt-2 text-sm text-emerald-600">Especiales y actividades</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Presencial</p>
                <p className="text-4xl font-bold">{stats.presencialCount}</p>
                <p className="mt-2 text-sm text-muted-foreground">Modalidad presencial</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Online</p>
                <p className="text-4xl font-bold">{stats.onlineCount}</p>
                <p className="mt-2 text-sm text-primary">Modalidad en línea</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <UserRoundPlus className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">Asistencia total hoy</p>
          <div className="mt-1 flex items-center gap-4">
            <h2 className="text-6xl font-bold leading-none">{yearlyAttendanceTotal || stats.total}</h2>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              Datos dinámicos por templo
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Historial de registros de los últimos 12 meses
          </p>
          <div className="mt-6 grid grid-cols-12 items-end gap-2">
            {stats.barHeights.map((h, i) => (
              <div
                key={i}
                className={`rounded-t-md ${i === 11 ? 'bg-primary' : 'bg-primary/15'}`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>La asistencia mensual ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            {registryState === 'loading' ? (
              <Skeleton className="h-[340px] w-full" />
            ) : null}
            {registryState === 'error' ? (
              <p className="text-sm text-destructive">No se pudo cargar la gráfica de asistencia anual.</p>
            ) : null}
            {registryState === 'ready' && monthlyChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay registros de asistencia anual para este templo y año.
              </p>
            ) : null}
            {registryState === 'ready' && monthlyChartData.length > 0 ? (
              <ChartContainer config={monthlyChartConfig} className="h-[340px] w-full">
                <BarChart accessibilityLayer data={monthlyChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} minTickGap={18} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          const point = payload?.[0]?.payload as { month?: string } | undefined;
                          if (!point?.month) return 'Asistencia mensual';
                          return point.month;
                        }}
                      />
                    }
                  />
                  <Bar dataKey="asistencia" fill="var(--color-asistencia)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asistencia por categoría ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            {registryState === 'loading' ? (
              <Skeleton className="h-[340px] w-full" />
            ) : null}
            {registryState === 'error' ? (
              <p className="text-sm text-destructive">No se pudo cargar la gráfica por categorías.</p>
            ) : null}
            {registryState === 'ready' && categoryChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay categorías con asistencia registrada para este templo y año.
              </p>
            ) : null}
            {registryState === 'ready' && categoryChartData.length > 0 ? (
              <ChartContainer config={categoryChartConfig} className="h-[340px] w-full">
                <BarChart
                  accessibilityLayer
                  data={categoryChartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} minTickGap={18} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          const point = payload?.[0]?.payload as { label?: string } | undefined;
                          return point?.label || 'Categoría';
                        }}
                      />
                    }
                  />
                  <Bar dataKey="asistencia" fill="var(--color-asistencia)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : null}
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Historial semestral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-3">Mes</th>
                      <th className="py-3">Cantidad de asistencia</th>
                      <th className="py-3">Pico</th>
                      <th className="py-3">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.monthlyRows.map((row) => (
                      <tr key={row.month} className="border-b last:border-0">
                        <td className="py-3 font-semibold">{row.month}</td>
                        <td className="py-3">{row.attendanceCount}</td>
                        <td className="py-3">{row.peak}</td>
                        <td className="py-3">
                          {row.trend === 'up'
                            ? '↗'
                            : row.trend === 'down'
                              ? '↘'
                              : '→'}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2">
                      <td className="py-3 font-extrabold">Total</td>
                      <td className="py-3 font-extrabold">{stats.semesterAttendanceTotal}</td>
                      <td className="py-3">-</td>
                      <td className="py-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end gap-3">
                {stats.growthBars.map((h, i) => (
                  <div
                    key={i}
                    className={`w-8 rounded-t-md ${
                      i === stats.growthBars.length - 1 ? 'bg-primary' : 'bg-primary/15'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Actual
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/20" />
                  Proyección
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
