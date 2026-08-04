'use client';

import * as React from 'react';
import {
  CalendarDays,
  Download,
  TrendingUp,
  TrendingDown,
  Wifi,
  BarChart2,
  FileText,
  UserRoundPlus,
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { REGISTRY_YEAR_OPTIONS, REGISTRY_MONTHS, REGISTRY_MONTH_SHORT_NAMES } from '@/lib/annual-registry';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type MonthKey =
  | 'enero' | 'febrero' | 'marzo' | 'abril' | 'mayo' | 'junio'
  | 'julio' | 'agosto' | 'septiembre' | 'octubre' | 'noviembre' | 'diciembre';

type CategoryRecord = { id: string; label: string; weeks: number[][] };
type MonthRecord = { month: string; period: string; categories: CategoryRecord[] };
type OnlineRegistryRecord = {
  churchId: string;
  churchName: string;
  year: string;
  eventName?: string;
  records: Record<MonthKey, MonthRecord>;
  initializedMonths: MonthKey[];
};

type ChurchItem = { id: string; name: string };
type MinistryItem = { id: string; name: string; churchId?: string };

const YEAR_OPTIONS = REGISTRY_YEAR_OPTIONS;
const MONTH_ORDER: MonthKey[] = [...REGISTRY_MONTHS];
const MONTH_SHORT = Object.fromEntries(
  REGISTRY_MONTHS.map((m, i) => [m, REGISTRY_MONTH_SHORT_NAMES[i]])
) as Record<MonthKey, string>;

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  zoom: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  otros: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const monthlyChartConfig = {
  asistencia: {
    label: 'Asistencia',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  asistencia: {
    label: 'Vistas/Conectados',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
const toMonthLabel = (date: Date) => {
  const label = monthFormatter.format(date);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

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

function getPlatformColor(id: string) {
  const key = id.toLowerCase();
  if (key.includes('youtube')) return PLATFORM_COLORS.youtube;
  if (key.includes('facebook')) return PLATFORM_COLORS.facebook;
  if (key.includes('zoom')) return PLATFORM_COLORS.zoom;
  return PLATFORM_COLORS.otros;
}

function monthTotal(record: MonthRecord): number {
  return record.categories.reduce(
    (sum, cat) => sum + cat.weeks.reduce((ws, week) => ws + week.reduce((ds, d) => ds + d, 0), 0),
    0
  );
}

function categoryAnnualTotal(records: Record<MonthKey, MonthRecord>, catId: string): number {
  return MONTH_ORDER.reduce((sum, m) => {
    const cat = records[m].categories.find((c) => c.id === catId);
    if (!cat) return sum;
    return sum + cat.weeks.reduce((ws, week) => ws + week.reduce((ds, d) => ds + d, 0), 0);
  }, 0);
}

function annualGrandTotal(records: Record<MonthKey, MonthRecord>): number {
  return MONTH_ORDER.reduce((sum, m) => sum + monthTotal(records[m]), 0);
}

function peakWeek(records: Record<MonthKey, MonthRecord>): { month: string; week: number; total: number } {
  let best = { month: '', week: 0, total: 0 };
  for (const m of MONTH_ORDER) {
    for (let w = 0; w < 5; w++) {
      const t = records[m].categories.reduce(
        (sum, cat) => sum + (cat.weeks[w]?.reduce((s, d) => s + d, 0) ?? 0),
        0
      );
      if (t > best.total) best = { month: records[m].month, week: w + 1, total: t };
    }
  }
  return best;
}

function growthRate(records: Record<MonthKey, MonthRecord>): number {
  const q1Months: MonthKey[] = ['enero', 'febrero', 'marzo'];
  const q2Months: MonthKey[] = ['abril', 'mayo', 'junio'];
  const q1 = q1Months.reduce((s, m) => s + monthTotal(records[m]), 0);
  const q2 = q2Months.reduce((s, m) => s + monthTotal(records[m]), 0);
  if (q1 === 0) return q2 > 0 ? 100 : 0;
  return Math.round(((q2 - q1) / q1) * 100);
}

function getUniqueCategories(records: Record<MonthKey, MonthRecord>): { id: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const m of MONTH_ORDER) {
    for (const cat of records[m].categories) {
      if (!seen.has(cat.id)) seen.set(cat.id, cat.label);
    }
  }
  return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
}

export default function OnlineReportePage() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = React.useState(
    YEAR_OPTIONS.includes(currentYear) ? currentYear : YEAR_OPTIONS[0]
  );
  const [churches, setChurches] = React.useState<ChurchItem[]>([]);
  const [selectedChurchId, setSelectedChurchId] = React.useState('');
  const [churchesState, setChurchesState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [ministries, setMinistries] = React.useState<MinistryItem[]>([]);
  const [selectedMinistryId, setSelectedMinistryId] = React.useState('');
  const [ministriesState, setMinistriesState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [registry, setRegistry] = React.useState<OnlineRegistryRecord | null>(null);
  const [registryState, setRegistryState] = React.useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');

  const selectedChurchName = churches.find((c) => c.id === selectedChurchId)?.name ?? '';
  const selectedMinistryName = ministries.find((m) => m.id === selectedMinistryId)?.name ?? '';

  const filteredMinistries = React.useMemo(() => {
    return ministries.filter((m) => !m.churchId || m.churchId === selectedChurchId);
  }, [ministries, selectedChurchId]);

  React.useEffect(() => {
    if (filteredMinistries.length > 0) {
      if (!filteredMinistries.some((m) => m.id === selectedMinistryId)) {
        setSelectedMinistryId(filteredMinistries[0].id);
      }
    } else {
      if (selectedMinistryId !== '') setSelectedMinistryId('');
    }
  }, [filteredMinistries, selectedMinistryId]);

  // Load churches
  React.useEffect(() => {
    const load = async () => {
      setChurchesState('loading');
      try {
        const res = await fetch('/api/churches?sessionChurchScope=1', { cache: 'no-store', headers: { Accept: 'application/json' } });
        const json = (await res.json().catch(() => ({}))) as { churches?: ChurchItem[]; error?: string };
        if (!res.ok) throw new Error(json.error || 'Error al cargar templos.');
        const list = (json.churches ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setChurches(list);
        setSelectedChurchId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? ''));
        setChurchesState('ready');
      } catch (e) {
        setChurchesState('error');
        toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Error al cargar.' });
      }
    };
    void load();
  }, [toast]);

  // Load ministries
  React.useEffect(() => {
    const load = async () => {
      setMinistriesState('loading');
      try {
        const res = await fetch('/api/ministries', { cache: 'no-store', headers: { Accept: 'application/json' } });
        const json = (await res.json().catch(() => ({}))) as { ministries?: MinistryItem[]; error?: string };
        if (!res.ok) throw new Error(json.error || 'Error al cargar ministerios.');
        const list = (json.ministries ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setMinistries(list);
        setSelectedMinistryId((prev) => (prev && list.some((m) => m.id === prev) ? prev : list[0]?.id ?? ''));
        setMinistriesState('ready');
      } catch (e) {
        setMinistriesState('error');
        toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Error al cargar.' });
      }
    };
    void load();
  }, [toast]);

  // Load registry
  React.useEffect(() => {
    if (!selectedChurchId || !selectedMinistryId) { setRegistry(null); setRegistryState('idle'); return; }
    let cancelled = false;
    setRegistryState('loading');
    setRegistry(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/online/registro?churchId=${encodeURIComponent(selectedChurchId)}&ministryId=${encodeURIComponent(selectedMinistryId)}&year=${encodeURIComponent(selectedYear)}`,
          { cache: 'no-store', headers: { Accept: 'application/json' } }
        );
        const json = (await res.json().catch(() => ({}))) as { record?: OnlineRegistryRecord | null; error?: string };
        if (!res.ok) throw new Error(json.error || 'Error al cargar.');
        if (cancelled) return;
        if (!json.record) { setRegistry(null); setRegistryState('empty'); return; }
        setRegistry(json.record);
        setRegistryState('ready');
      } catch (e) {
        if (!cancelled) {
          setRegistryState('error');
          toast({ variant: 'destructive', title: 'Error al cargar reporte', description: e instanceof Error ? e.message : 'Inténtalo de nuevo.' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selectedChurchId, selectedMinistryId, selectedYear, toast]);

  const rec = registry;
  const categories = rec ? getUniqueCategories(rec.records) : [];
  const grandTotal = rec ? annualGrandTotal(rec.records) : 0;
  const peak = rec ? peakWeek(rec.records) : null;
  const growth = rec ? growthRate(rec.records) : 0;
  const monthlyTotals = rec ? MONTH_ORDER.map((m) => monthTotal(rec.records[m])) : [];

  const monthlyChartData = React.useMemo(() => {
    if (!rec) return [] as Array<{ label: string; month: string; asistencia: number }>;
    return MONTH_ORDER.map((monthKey) => {
      const monthData = rec.records[monthKey];
      const monthLabel = toMonthLabel(new Date(Number(selectedYear), MONTH_ORDER.indexOf(monthKey), 1));
      if (!monthData) return { label: monthLabel, month: monthLabel, asistencia: 0 };
      return { label: monthLabel, month: monthLabel, asistencia: monthTotal(monthData) };
    });
  }, [rec, selectedYear]);

  const categoryChartData = React.useMemo(() => {
    if (!rec) return [] as Array<{ label: string; asistencia: number }>;
    return categories.map(cat => ({
      label: cat.label,
      asistencia: categoryAnnualTotal(rec.records, cat.id)
    })).sort((a, b) => b.asistencia - a.asistencia);
  }, [rec, categories]);

  const handleDownloadPdf = () => {
    if (!selectedChurchName || !rec) return;

    const doc = new jsPDF() as AutoTableDoc;
    const generatedAt = new Date().toLocaleString('es-ES');
    const monthlyRows = monthlyChartData.map((item) => [item.month, item.asistencia]);
    const categoryRows = categoryChartData.map((item) => [item.label, item.asistencia]);

    const detailedRows = MONTH_ORDER.map((m) => {
      const mRec = rec.records[m];
      const mTotal = monthTotal(mRec);
      const row = [mRec.month];
      categories.forEach((cat) => {
        const found = mRec.categories.find((c) => c.id === cat.id);
        const val = found ? found.weeks.reduce((s, w) => s + w.reduce((sd, d) => sd + d, 0), 0) : 0;
        row.push(val.toString());
      });
      row.push(mTotal.toString());
      return row;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Reporte de Asistencia Online', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Templo: ${selectedChurchName}`, 14, 26);
    if (selectedMinistryName) doc.text(`Ministerio: ${selectedMinistryName}`, 14, 32);
    doc.text(`Año: ${selectedYear}`, 14, selectedMinistryName ? 38 : 32);
    doc.text(`Generado: ${generatedAt}`, 14, selectedMinistryName ? 44 : 38);

    doc.autoTable({
      head: [['Resumen general', 'Cantidad']],
      body: [
        ['Gran Total Online', grandTotal],
        ['Semana pico', peak ? `${peak.month} · S${peak.week} (${peak.total})` : 'Sin datos'],
        ['Meses con datos', monthlyTotals.filter((t) => t > 0).length],
        ['Crecimiento Q1→Q2', `${growth >= 0 ? '+' : ''}${growth}%`],
      ],
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
    });

    const firstTableEnd = doc.lastAutoTable?.finalY ?? 60;
    doc.autoTable({
      head: [['Asistencia mensual', 'Cantidad']],
      body: monthlyRows,
      startY: firstTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
    });

    const secondTableEnd = doc.lastAutoTable?.finalY ?? firstTableEnd + 16;
    doc.autoTable({
      head: [[`Plataformas (${selectedYear})`, 'Vistas/Conectados']],
      body: categoryRows.length > 0 ? categoryRows : [['Sin datos', 0]],
      startY: secondTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
    });

    const thirdTableEnd = doc.lastAutoTable?.finalY ?? secondTableEnd + 16;
    doc.autoTable({
      head: [['Mes', ...categories.map(c => c.label), 'Total']],
      body: detailedRows,
      startY: thirdTableEnd + 8,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
    });

    const churchFileName = selectedChurchName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    doc.save(`reporte-online-${selectedYear}-${churchFileName || 'templo'}.pdf`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Reporte Online"
        stacked
        description={
          selectedChurchId && selectedMinistryId
            ? `${selectedChurchName} - ${selectedMinistryName}`
            : 'Análisis de asistencia en eventos transmitidos'
        }
      >
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_140px_auto]">
          <Select
            value={selectedChurchId}
            onValueChange={setSelectedChurchId}
            disabled={churchesState !== 'ready' || churches.length === 0}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder={churchesState === 'loading' ? 'Cargando templos…' : 'Seleccione templo'} />
            </SelectTrigger>
            <SelectContent>
              {churches.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedMinistryId}
            onValueChange={setSelectedMinistryId}
            disabled={ministriesState !== 'ready' || filteredMinistries.length === 0}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder={ministriesState === 'loading' ? 'Cargando ministerios…' : 'Ministerio'} />
            </SelectTrigger>
            <SelectContent>
              {filteredMinistries.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            disabled={churchesState !== 'ready' || churches.length === 0}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full xl:w-auto" disabled={!selectedChurchId || !selectedMinistryId || !rec} onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </AppHeader>

      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">

        {/* States */}
        {registryState === 'loading' && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        )}

        {registryState === 'idle' && (
          <Card className="border-dashed">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Wifi className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Selecciona un templo para ver el reporte online</p>
            </CardContent>
          </Card>
        )}

        {registryState === 'empty' && (
          <Card className="border-dashed border-border">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Wifi className="h-10 w-10" />
              </div>
              <p className="text-xl font-semibold">Sin registros online para {selectedYear}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Aún no hay asistencia online guardada para <strong>{selectedChurchName}</strong> en {selectedYear}.
                Ve a <strong>Online › Registro</strong> para capturar datos.
              </p>
            </CardContent>
          </Card>
        )}

        {registryState === 'ready' && rec && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Grand total */}
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Gran Total Online</p>
                    <p className="text-4xl font-bold">{grandTotal.toLocaleString()}</p>
                    <p className="mt-2 text-sm text-primary">Vistas y conexiones ({selectedYear})</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Wifi className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Peak week */}
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Semana Pico</p>
                    <p className="text-4xl font-bold">{peak?.total.toLocaleString() ?? 0}</p>
                    <p className="mt-2 text-sm text-emerald-600">
                      {peak && peak.total > 0 ? `${peak.month} · Semana ${peak.week}` : 'Sin datos'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Growth Q1→Q2 */}
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Crecimiento Q1→Q2</p>
                    <p className={cn('text-4xl font-bold', growth >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                      {growth >= 0 ? '+' : ''}{growth}%
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Comparando primer y segundo trimestre
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    {growth >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  </div>
                </CardContent>
              </Card>

              {/* Months with data */}
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Meses con datos</p>
                    <p className="text-4xl font-bold">{monthlyTotals.filter((t) => t > 0).length}/12</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Meses con asistencia registrada
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly bar chart (Recharts) */}
            <Card>
              <CardHeader>
                <CardTitle>Asistencia mensual online ({selectedYear})</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay registros de asistencia anual online para este templo y año.
                  </p>
                ) : (
                  <ChartContainer config={monthlyChartConfig} className="h-[340px] w-full">
                    <BarChart accessibilityLayer data={monthlyChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} minTickGap={18} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(_, payload) => {
                              const point = payload?.[0]?.payload as { month?: string } | undefined;
                              return point?.month || 'Asistencia mensual';
                            }}
                          />
                        }
                      />
                      <Bar dataKey="asistencia" fill="var(--color-asistencia)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Per-platform breakdown */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {categories.map((cat) => {
                const catTotal = categoryAnnualTotal(rec.records, cat.id);
                const pct = grandTotal > 0 ? Math.round((catTotal / grandTotal) * 100) : 0;
                const monthlyData = MONTH_ORDER.map((m) => {
                  const found = rec.records[m].categories.find((c) => c.id === cat.id);
                  return { name: MONTH_SHORT[m], value: found ? found.weeks.reduce((s, w) => s + w.reduce((sd, d) => sd + d, 0), 0) : 0 };
                });
                
                // Color override for the chart
                const chartColor = getPlatformColor(cat.id).match(/text-([a-z]+)-/)?.[1] || 'primary';
                const colorMap: Record<string, string> = {
                  red: 'hsl(var(--destructive))',
                  blue: 'hsl(217.2 91.2% 59.8%)',
                  sky: 'hsl(199 89% 48%)',
                  slate: 'hsl(215.4 16.3% 46.9%)',
                };
                const fillCol = colorMap[chartColor] || 'hsl(var(--primary))';

                return (
                  <Card key={cat.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', getPlatformColor(cat.id))}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="mt-3 text-4xl font-extrabold tabular-nums">{catTotal.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">vistas / conectados en {selectedYear}</p>
                      <div className="mt-4 h-16 w-full">
                        <ChartContainer config={{ value: { label: 'Asistencia', color: fillCol } }} className="h-full w-full">
                          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Bar dataKey="value" fill="var(--color-value)" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                        <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                          <span>Ene</span><span>Jun</span><span>Dic</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Monthly detail table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Detalle mensual por plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-4 py-3 text-left font-semibold">Mes</th>
                        {categories.map((cat) => (
                          <th key={cat.id} className="px-4 py-3 text-right font-semibold">{cat.label}</th>
                        ))}
                        <th className="px-4 py-3 text-right font-semibold text-primary">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTH_ORDER.map((m, rowIdx) => {
                        const mRec = rec.records[m];
                        const mTotal = monthTotal(mRec);
                        return (
                          <tr key={m} className={cn('border-b transition-colors hover:bg-muted/30', rowIdx % 2 === 0 ? '' : 'bg-muted/10')}>
                            <td className="px-4 py-2.5 font-medium">{mRec.month}</td>
                            {categories.map((cat) => {
                              const found = mRec.categories.find((c) => c.id === cat.id);
                              const val = found ? found.weeks.reduce((s, w) => s + w.reduce((sd, d) => sd + d, 0), 0) : 0;
                              return (
                                <td key={cat.id} className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                                  {val > 0 ? val.toLocaleString() : <span className="text-muted-foreground/40">—</span>}
                                </td>
                              );
                            })}
                            <td className={cn('px-4 py-2.5 text-right font-bold tabular-nums', mTotal > 0 ? 'text-primary' : 'text-muted-foreground/40')}>
                              {mTotal > 0 ? mTotal.toLocaleString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Totals row */}
                      <tr className="border-t-2 bg-muted/20 font-bold">
                        <td className="px-4 py-3 uppercase tracking-wide text-xs text-muted-foreground">Total Anual</td>
                        {categories.map((cat) => (
                          <td key={cat.id} className="px-4 py-3 text-right tabular-nums">
                            {categoryAnnualTotal(rec.records, cat.id).toLocaleString()}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right tabular-nums text-primary">
                          {grandTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
