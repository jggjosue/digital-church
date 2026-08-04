'use client';

import * as React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileText,
  Loader2,
  Smile,
  TrendingUp,
  UploadCloud,
  Users,
  UserRoundPlus,
  Wifi,
  XCircle,
  Youtube,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RegistrySelector } from '@/components/annual-registry/registry-selector';
import { RegistryImportCard } from '@/components/annual-registry/registry-import-card';
import { RegistryCalendarScroller } from '@/components/annual-registry/registry-calendar-scroller';
import { RegistryDraftStatus } from '@/components/annual-registry/registry-draft-status';
import { useRegistryDraftGuard } from '@/hooks/use-registry-draft-guard';
import {
  REGISTRY_MONTHS,
  REGISTRY_MONTH_SHORT_NAMES,
  REGISTRY_YEAR_OPTIONS,
  createRegistryCategoryId,
  getRegistryCalendarCell,
  normalizeRegistryLabel,
  registryAnnualTotal,
  registryCategoryTotal,
  registryCategoryTotals,
  registryMonthTotal,
  registryWeekTotal,
  type RegistryMonthKey,
} from '@/lib/annual-registry';

type MonthKey = RegistryMonthKey;

type CategoryRecord = {
  id: string;
  label: string;
  weeks: number[][];
  isCustom?: boolean;
};

type MonthRecord = {
  month: string;
  period: string;
  categories: CategoryRecord[];
};

type ChurchItem = {
  id: string;
  name: string;
};

type MinistryItem = {
  id: string;
  name: string;
  churchId?: string;
};

type OnlineRegistryApiRecord = {
  churchId: string;
  churchName: string;
  ministryId: string;
  ministryName: string;
  year: string;
  eventName?: string;
  records: Record<MonthKey, MonthRecord>;
  initializedMonths: MonthKey[];
};

const YEAR_OPTIONS = REGISTRY_YEAR_OPTIONS;
const MONTH_ORDER: MonthKey[] = [...REGISTRY_MONTHS];
const MONTH_SHORT_LABEL = Object.fromEntries(
  REGISTRY_MONTHS.map((month, index) => [month, REGISTRY_MONTH_SHORT_NAMES[index]])
) as Record<MonthKey, string>;

const WEEK_DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] as const;

const buildWeekFromTotal = () => Array.from({ length: 7 }, () => 0);
const buildWeeks = (totals: number[]) => totals.map(() => buildWeekFromTotal());
const cloneMonthData = (data: Record<MonthKey, MonthRecord>): Record<MonthKey, MonthRecord> =>
  JSON.parse(JSON.stringify(data)) as Record<MonthKey, MonthRecord>;
const normalizeString = normalizeRegistryLabel;
const categoryIdFromLabel = createRegistryCategoryId;

const distributeWeeklyTotal = (total: number) => {
  const safeTotal = Math.max(0, Math.floor(total));
  const base = Math.floor(safeTotal / 7);
  const remainder = safeTotal % 7;
  return Array.from({ length: 7 }, (_, idx) => base + (idx < remainder ? 1 : 0));
};

/** Categorías base para eventos online */
const baseOnlineCategories: CategoryRecord[] = [
  { id: 'youtube', label: 'YouTube', weeks: [] },
  { id: 'facebook', label: 'Facebook Live', weeks: [] },
  { id: 'zoom', label: 'Zoom', weeks: [] },
  { id: 'otros', label: 'Otros', weeks: [] },
];

const buildInitialData = (): Record<MonthKey, MonthRecord> => {
  const periods: Record<MonthKey, string> = {
    enero: 'Q1 PERIOD', febrero: 'Q1 PERIOD', marzo: 'Q1 PERIOD',
    abril: 'Q2 PERIOD', mayo: 'Q2 PERIOD', junio: 'Q2 PERIOD',
    julio: 'Q3 PERIOD', agosto: 'Q3 PERIOD', septiembre: 'Q3 PERIOD',
    octubre: 'Q4 PERIOD', noviembre: 'Q4 PERIOD', diciembre: 'Q4 PERIOD',
  };
  const monthNames: Record<MonthKey, string> = {
    enero: 'Enero', febrero: 'Febrero', marzo: 'Marzo',
    abril: 'Abril', mayo: 'Mayo', junio: 'Junio',
    julio: 'Julio', agosto: 'Agosto', septiembre: 'Septiembre',
    octubre: 'Octubre', noviembre: 'Noviembre', diciembre: 'Diciembre',
  };
  return Object.fromEntries(
    REGISTRY_MONTHS.map((month) => [
      month,
      {
        month: monthNames[month],
        period: periods[month],
        categories: baseOnlineCategories.map((cat) => ({
          ...cat,
          weeks: buildWeeks([0, 0, 0, 0, 0]),
        })),
      },
    ])
  ) as Record<MonthKey, MonthRecord>;
};

const initialData = buildInitialData();

const monthIndexByKey: Record<MonthKey, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

export default function OnlineRegistroPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const currentYear = new Date().getFullYear().toString();

  const [expandedMonth, setExpandedMonth] = React.useState<MonthKey>('enero');
  const [recordsByYear, setRecordsByYear] = React.useState<Record<string, Record<MonthKey, MonthRecord>>>(
    () => Object.fromEntries(YEAR_OPTIONS.map((year) => [year, cloneMonthData(initialData)])) as Record<string, Record<MonthKey, MonthRecord>>
  );
  const [selectedYear, setSelectedYear] = React.useState<string>(
    YEAR_OPTIONS.includes(currentYear) ? currentYear : YEAR_OPTIONS[0]
  );
  const [initializedMonthsByYear, setInitializedMonthsByYear] = React.useState<Record<string, MonthKey[]>>(
    () => Object.fromEntries(YEAR_OPTIONS.map((year) => [year, [...MONTH_ORDER] as MonthKey[]])) as Record<string, MonthKey[]>
  );
  const [churches, setChurches] = React.useState<ChurchItem[]>([]);
  const [selectedChurchId, setSelectedChurchId] = React.useState<string>('');
  const [churchesState, setChurchesState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [ministries, setMinistries] = React.useState<MinistryItem[]>([]);
  const [selectedMinistryId, setSelectedMinistryId] = React.useState<string>('');
  const [ministriesState, setMinistriesState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [newCategoryByMonth, setNewCategoryByMonth] = React.useState<Record<MonthKey, string>>(
    Object.fromEntries(REGISTRY_MONTHS.map((m) => [m, ''])) as Record<MonthKey, string>
  );
  const [inlineCategoryInputByMonth, setInlineCategoryInputByMonth] = React.useState<Record<MonthKey, boolean>>(
    Object.fromEntries(REGISTRY_MONTHS.map((m) => [m, false])) as Record<MonthKey, boolean>
  );
  const [editingCategoryByMonth, setEditingCategoryByMonth] = React.useState<Partial<Record<MonthKey, string | null>>>({});
  const [editingCategoryLabel, setEditingCategoryLabel] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isLoadingRegistry, setIsLoadingRegistry] = React.useState(false);
  const [lastSavedByYearAndMinistry, setLastSavedByYearAndMinistry] = React.useState<Record<string, OnlineRegistryApiRecord>>({});
  const [eventName, setEventName] = React.useState('');

  const currentYearRecords = recordsByYear[selectedYear] ?? cloneMonthData(initialData);
  const initializedMonths = initializedMonthsByYear[selectedYear] ?? (['enero'] as MonthKey[]);
  const selectedChurchName = churches.find((c) => c.id === selectedChurchId)?.name ?? 'Templo no seleccionado';
  const selectedMinistryName = ministries.find((m) => m.id === selectedMinistryId)?.name ?? 'Ministerio no seleccionado';
  const saveKey = `${selectedChurchId || 'none'}:${selectedMinistryId || 'none'}:${selectedYear}`;

  const filteredMinistries = React.useMemo(() => {
    return ministries.filter((m) => !m.churchId || m.churchId === selectedChurchId);
  }, [ministries, selectedChurchId]);

  React.useEffect(() => {
    if (filteredMinistries.length > 0) {
      if (!filteredMinistries.some((m) => m.id === selectedMinistryId)) {
        if (draft.confirmDiscard()) {
          setSelectedMinistryId(filteredMinistries[0].id);
        }
      }
    } else {
      if (selectedMinistryId !== '') {
        if (draft.confirmDiscard()) setSelectedMinistryId('');
      }
    }
  }, [filteredMinistries, selectedMinistryId]);

  const todayStart = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const weekDaysForMonth = (month: MonthKey, weekIndex: number) => {
    const year = Number(selectedYear);
    const mIndex = monthIndexByKey[month];
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const dateObj = getRegistryCalendarCell(year, mIndex, weekIndex, dayIndex);
      const dayNumber = dateObj?.getDate() ?? 0;
      const inMonth = Boolean(dateObj);
      const canEdit = Boolean(dateObj);
      const monthLabel = String(mIndex + 1).padStart(2, '0');
      return {
        dayLabel: WEEK_DAY_LABELS[dayIndex],
        dateLabel: inMonth ? String(dayNumber).padStart(2, '0') : '--',
        fullDateLabel: inMonth ? `${String(dayNumber).padStart(2, '0')}/${monthLabel}/${year}` : '--/--/----',
        inMonth,
        canEdit,
      };
    });
  };

  const monthWeekTotal = (month: MonthKey, weekIndex: number) =>
    registryWeekTotal(currentYearRecords[month].categories, weekIndex);

  const monthTotal = (month: MonthKey) => registryMonthTotal(currentYearRecords[month]);

  const annualGrandTotal = React.useMemo(() => registryAnnualTotal(currentYearRecords), [currentYearRecords]);
  const initializedMonthsMemo = initializedMonths;
  const annualCategoryCards = React.useMemo(
    () => registryCategoryTotals(currentYearRecords, initializedMonthsMemo),
    [currentYearRecords, initializedMonthsMemo]
  );

  const monthsReported = React.useMemo(
    () => MONTH_ORDER.filter((month) => monthTotal(month) > 0).length,
    [recordsByYear, selectedYear]
  );

  // Peak weekly attendance per month
  const weeklyPeakByMonth = React.useMemo(() => {
    return MONTH_ORDER.map((m) => {
      const monthRec = currentYearRecords[m];
      let bestW = 0;
      let bestTotal = 0;
      for (let w = 0; w < 5; w += 1) {
        const t = monthRec.categories.reduce(
          (sum, cat) => sum + (cat.weeks[w]?.reduce((s, d) => s + d, 0) ?? 0),
          0
        );
        if (t > bestTotal) { bestTotal = t; bestW = w; }
      }
      return { key: m, label: MONTH_SHORT_LABEL[m], max: bestTotal, weekIndex: bestTotal > 0 ? bestW + 1 : null };
    });
  }, [currentYearRecords]);

  const annualPeakWeek = React.useMemo(
    () => weeklyPeakByMonth.reduce((acc, row) => Math.max(acc, row.max), 0),
    [weeklyPeakByMonth]
  );

  const updateDayValue = (month: MonthKey, categoryId: string, weekIndex: number, dayIndex: number, value: string) => {
    const next = Number(value);
    setRecordsByYear((prev) => ({
      ...prev,
      [selectedYear]: {
        ...currentYearRecords,
        [month]: {
          ...currentYearRecords[month],
          categories: currentYearRecords[month].categories.map((cat) =>
            cat.id !== categoryId ? cat : {
              ...cat,
              weeks: cat.weeks.map((week, idx) =>
                idx !== weekIndex ? week : week.map((d, dIdx) => dIdx === dayIndex ? (Number.isNaN(next) ? 0 : Math.max(0, next)) : d)
              ),
            }
          ),
        },
      },
    }));
  };

  const updateWeekTotal = (month: MonthKey, categoryId: string, weekIndex: number, value: string) => {
    const next = Number(value);
    const nextWeek = distributeWeeklyTotal(Number.isNaN(next) ? 0 : next);
    setRecordsByYear((prev) => ({
      ...prev,
      [selectedYear]: {
        ...currentYearRecords,
        [month]: {
          ...currentYearRecords[month],
          categories: currentYearRecords[month].categories.map((cat) =>
            cat.id !== categoryId ? cat : {
              ...cat,
              weeks: cat.weeks.map((week, idx) => (idx === weekIndex ? nextWeek : week)),
            }
          ),
        },
      },
    }));
  };

  const handleAddCategory = (month: MonthKey) => {
    const nextLabel = newCategoryByMonth[month].trim();
    if (!nextLabel) return;
    const existing = currentYearRecords[month].categories.find(
      (cat) => normalizeString(cat.label) === normalizeString(nextLabel)
    );
    if (existing) {
      toast({ variant: 'destructive', title: 'Categoría duplicada', description: `La categoría "${existing.label}" ya existe.` });
      return;
    }
    const nextId = categoryIdFromLabel(nextLabel);
    setRecordsByYear((prev) => ({
      ...prev,
      [selectedYear]: {
        ...currentYearRecords,
        [month]: {
          ...currentYearRecords[month],
          categories: [
            ...currentYearRecords[month].categories,
            { id: nextId, label: nextLabel, weeks: Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => 0)), isCustom: true },
          ],
        },
      },
    }));
    setNewCategoryByMonth((prev) => ({ ...prev, [month]: '' }));
    setInlineCategoryInputByMonth((prev) => ({ ...prev, [month]: false }));
  };

  const handleRemoveCategory = (month: MonthKey, categoryId: string) => {
    const cat = currentYearRecords[month].categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setRecordsByYear((prev) => ({
      ...prev,
      [selectedYear]: {
        ...currentYearRecords,
        [month]: {
          ...currentYearRecords[month],
          categories: currentYearRecords[month].categories.filter((c) => c.id !== categoryId),
        },
      },
    }));
    toast({ title: 'Categoría eliminada', description: `Se eliminó la columna "${cat.label}".` });
  };

  const handleStartEditCategory = (month: MonthKey, categoryId: string) => {
    const cat = currentYearRecords[month].categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setEditingCategoryByMonth((prev) => ({ ...prev, [month]: categoryId }));
    setEditingCategoryLabel(cat.label);
  };

  const handleSaveCategoryTitle = (month: MonthKey, categoryId: string) => {
    const nextLabel = editingCategoryLabel.trim();
    if (!nextLabel) { setEditingCategoryByMonth((prev) => ({ ...prev, [month]: null })); return; }
    setRecordsByYear((prev) => ({
      ...prev,
      [selectedYear]: {
        ...currentYearRecords,
        [month]: {
          ...currentYearRecords[month],
          categories: currentYearRecords[month].categories.map((c) => c.id === categoryId ? { ...c, label: nextLabel } : c),
        },
      },
    }));
    setEditingCategoryByMonth((prev) => ({ ...prev, [month]: null }));
  };

  const handleInitializeMonth = (month: MonthKey) => {
    setInitializedMonthsByYear((prev) => {
      const current = prev[selectedYear] ?? (['enero'] as MonthKey[]);
      if (current.includes(month)) return prev;
      return { ...prev, [selectedYear]: [...current, month] };
    });
    setExpandedMonth(month);
    toast({ title: `${currentYearRecords[month].month} inicializado`, description: 'Ya puedes capturar asistencia online semanal en este mes.' });
  };

  const handleSaveRegistry = async (silent = false): Promise<boolean> => {
    if (!selectedChurchId) {
      toast({ variant: 'destructive', title: 'Selecciona un templo', description: 'Debes seleccionar un templo para guardar la asistencia online.' });
      return false;
    }
    if (!selectedMinistryId) {
      toast({ variant: 'destructive', title: 'Selecciona un ministerio', description: 'Debes seleccionar un ministerio para guardar la asistencia online.' });
      return false;
    }
    setIsSaving(true);
    try {
      const payload = {
        churchId: selectedChurchId,
        churchName: selectedChurchName,
        ministryId: selectedMinistryId,
        ministryName: selectedMinistryName,
        year: selectedYear,
        eventName: eventName.trim(),
        records: currentYearRecords,
        initializedMonths,
      };
      const response = await fetch('/api/online/registro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) throw new Error(json.error || 'No se pudo guardar la asistencia online.');
      const storedEventName = eventName.trim().length > 0 ? eventName.trim() : `Asistencia online ${selectedYear}`;
      setLastSavedByYearAndMinistry((prev) => ({ ...prev, [saveKey]: { ...payload, eventName: storedEventName } }));
      if (!silent) toast({ title: 'Asistencia online guardada', description: json.message || 'Los cambios fueron guardados correctamente.' });
      return true;
    } catch (error) {
      if (!silent) toast({ variant: 'destructive', title: 'Error al guardar', description: error instanceof Error ? error.message : 'Inténtalo de nuevo.' });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Load churches
  React.useEffect(() => {
    const loadChurches = async () => {
      setChurchesState('loading');
      try {
        const response = await fetch('/api/churches?sessionChurchScope=1', { cache: 'no-store', headers: { Accept: 'application/json' } });
        const json = (await response.json().catch(() => ({}))) as { churches?: ChurchItem[]; error?: string };
        if (!response.ok) throw new Error(json.error || 'No se pudo cargar la lista de templos.');
        const nextChurches = (json.churches ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setChurches(nextChurches);
        setSelectedChurchId((prev) => {
          if (prev && nextChurches.some((c) => c.id === prev)) return prev;
          return nextChurches[0]?.id ?? '';
        });
        setChurchesState('ready');
      } catch (error) {
        setChurchesState('error');
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Inténtalo nuevamente.' });
      }
    };
    void loadChurches();
  }, [toast]);

  // Load ministries
  React.useEffect(() => {
    const loadMinistries = async () => {
      setMinistriesState('loading');
      try {
        const response = await fetch('/api/ministries', { cache: 'no-store', headers: { Accept: 'application/json' } });
        const json = (await response.json().catch(() => ({}))) as { ministries?: MinistryItem[]; error?: string };
        if (!response.ok) throw new Error(json.error || 'No se pudo cargar la lista de ministerios.');
        const nextMinistries = (json.ministries ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setMinistries(nextMinistries);
        setSelectedMinistryId((prev) => {
          if (prev && nextMinistries.some((m) => m.id === prev)) return prev;
          return nextMinistries[0]?.id ?? '';
        });
        setMinistriesState('ready');
      } catch (error) {
        setMinistriesState('error');
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Inténtalo nuevamente.' });
      }
    };
    void loadMinistries();
  }, [toast]);

  // Load registry on church/ministry/year change
  React.useEffect(() => {
    if (!selectedChurchId || !selectedMinistryId) { setEventName(''); return; }
    let cancelled = false;
    const loadRegistry = async () => {
      setIsLoadingRegistry(true);
      setEventName('');
      try {
        const response = await fetch(
          `/api/online/registro?churchId=${encodeURIComponent(selectedChurchId)}&ministryId=${encodeURIComponent(selectedMinistryId)}&year=${encodeURIComponent(selectedYear)}`,
          { cache: 'no-store', headers: { Accept: 'application/json' } }
        );
        const json = (await response.json().catch(() => ({}))) as { record?: OnlineRegistryApiRecord | null; error?: string };
        if (!response.ok) throw new Error(json.error || 'No se pudo cargar el registro online.');
        if (cancelled) return;
        if (!json.record) {
          setRecordsByYear((prev) => ({ ...prev, [selectedYear]: cloneMonthData(initialData) }));
          setInitializedMonthsByYear((prev) => ({ ...prev, [selectedYear]: [...MONTH_ORDER] }));
          return;
        }
        const record = json.record;
        setRecordsByYear((prev) => ({ ...prev, [selectedYear]: record.records }));
        setInitializedMonthsByYear((prev) => ({
          ...prev,
          [selectedYear]: record.initializedMonths.length > 0 ? record.initializedMonths : [...MONTH_ORDER],
        }));
        setLastSavedByYearAndMinistry((prev) => ({ ...prev, [saveKey]: record }));
        setEventName(record.eventName?.trim() ? record.eventName.trim() : '');
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error al cargar asistencia online', description: error instanceof Error ? error.message : 'Inténtalo de nuevo.' });
      } finally {
        if (!cancelled) setIsLoadingRegistry(false);
      }
    };
    void loadRegistry();
    return () => { cancelled = true; };
  }, [selectedChurchId, selectedMinistryId, selectedYear, toast, saveKey]);

  const draft = useRegistryDraftGuard({
    value: { records: currentYearRecords, initializedMonths, eventName },
    identity: `${selectedChurchId}:${selectedMinistryId}:${selectedYear}:online`,
    loading: isLoadingRegistry,
    onRestore: (value) => {
      setRecordsByYear((prev) => ({ ...prev, [selectedYear]: value.records }));
      setInitializedMonthsByYear((prev) => ({ ...prev, [selectedYear]: value.initializedMonths }));
      setEventName(value.eventName);
    },
    onAutoSave: () => handleSaveRegistry(true),
  });
  const changeChurch = (value: string) => { if (draft.confirmDiscard()) setSelectedChurchId(value); };
  const changeMinistry = (value: string) => { if (draft.confirmDiscard()) setSelectedMinistryId(value); };
  const changeYear = (value: string) => { if (draft.confirmDiscard()) setSelectedYear(value); };
  const manualSave = async () => { if (await handleSaveRegistry()) draft.markSaved(); };

  return (
    <div className="relative flex flex-1 flex-col">
      {isImporting ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/75 backdrop-blur-sm" role="status" aria-live="polite" aria-busy="true">
          <Loader2 className="h-14 w-14 animate-spin text-primary" aria-hidden />
          <p className="text-xl font-semibold text-foreground">Cargando datos…</p>
        </div>
      ) : null}

      {/* Page header with online accent */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-background to-background">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Wifi className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Asistencia Online {selectedYear}</h1>
              <CardContent className="pt-6">
                Registro de eventos transmitidos · Templo: <span className="font-medium text-foreground">{selectedChurchName}</span> · Ministerio: <span className="font-medium text-foreground">{selectedMinistryName}</span>
              </CardContent>
            </div>
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1 space-y-5 bg-muted/20 p-3 pb-28 min-[380px]:p-4 min-[380px]:pb-28 sm:p-8 sm:pb-28">

        {/* Selector cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border">
            <CardContent className="p-4">
              <RegistrySelector
                churches={churches}
                churchId={selectedChurchId}
                onChurchChange={changeChurch}
                churchState={churchesState}
                year={selectedYear}
                years={YEAR_OPTIONS}
                onYearChange={changeYear}
                churchLabel="Templo"
                placeholder="Selecciona un templo"
                loadingPlaceholder="Cargando templos..."
                yearLabel="Año"
              />
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <RegistrySelector
                churches={filteredMinistries}
                churchId={selectedMinistryId}
                onChurchChange={changeMinistry}
                churchState={ministriesState}
                year={selectedYear}
                years={YEAR_OPTIONS}
                onYearChange={changeYear}
                churchLabel="Fraternidad / Ministerio"
                placeholder="Selecciona un ministerio"
                loadingPlaceholder="Cargando ministerios..."
                yearLabel="Año"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4"><RegistryDraftStatus dirty={draft.dirty} lastSavedAt={draft.lastSavedAt} autoSave={draft.autoSave} onAutoSaveChange={draft.setAutoSave} autoSaving={draft.autoSaving} onUndo={draft.undo} /></div>

            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Nombre del evento o transmisión (opcional)</Label>
              <Input
                id="online-event-name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder={`Ej. Servicio dominical online ${selectedYear}, campaña verano…`}
                maxLength={200}
                autoComplete="off"
                disabled={isLoadingRegistry}
                aria-label="Nombre del evento online"
              />
            </div>

            {/* Platform legend */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: 'YouTube', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-200/40 dark:border-red-800/40' },
                { label: 'Facebook Live', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200/40 dark:border-blue-800/40' },
                { label: 'Zoom', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-200/40 dark:border-sky-800/40' },
                { label: 'Otros', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200/40 dark:border-slate-800/40' },
              ].map((p) => (
                <span key={p.label} className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', p.color)}>
                  {p.label}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                + Categoría personalizada
              </span>
            </div>


        {/* Monthly accordion */}
        {MONTH_ORDER.map((monthKey) => {
          const monthData = currentYearRecords[monthKey];
          const expanded = expandedMonth === monthKey;
          const isMonthInitialized = initializedMonths.includes(monthKey);
          const mTotal = monthTotal(monthKey);

          return (
            <Card key={monthKey} className={cn('overflow-hidden transition-shadow', expanded && 'shadow-md shadow-primary/10')}>
              <button
                type="button"
                onClick={() => setExpandedMonth(monthKey)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold leading-tight">{monthData.month}</p>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">{monthData.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase text-primary">
                      ID: {selectedYear}-{String(monthIndexByKey[monthKey] + 1).padStart(2, '0')}
                    </p>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Vistas / Conectados</p>
                    <p className="text-4xl font-bold text-primary">{mTotal.toLocaleString()}</p>
                  </div>
                  <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                </div>
              </button>

              {expanded ? (
                isMonthInitialized ? (
                  <CardContent className="border-t p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {Array.from({ length: 5 }, (_, weekIndex) => {
                        const weekDays = weekDaysForMonth(monthKey, weekIndex);
                        const weekTotal = monthWeekTotal(monthKey, weekIndex);
                        return (
                          <Card key={`${monthKey}-week-${weekIndex}`} className="border bg-background">
                            <CardContent className="space-y-4 p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-foreground">Semana {weekIndex + 1}</p>
                                <p className="text-sm font-semibold text-primary">Total: {weekTotal.toLocaleString()}</p>
                              </div>
                              <RegistryCalendarScroller minWidth={760}>
                                <div
                                  className="grid gap-2"
                                  style={{ gridTemplateColumns: `140px repeat(${currentYearRecords[monthKey].categories.length}, minmax(96px, 1fr)) 180px` }}
                                >
                                  {/* Header row */}
                                  <div className="rounded-lg border bg-muted/40 px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Día</div>
                                  {currentYearRecords[monthKey].categories.map((cat) => (
                                    <div
                                      key={`head-${cat.id}-${weekIndex}`}
                                      className="relative rounded-lg border bg-muted/40 px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground"
                                      onDoubleClick={() => handleStartEditCategory(monthKey, cat.id)}
                                      title="Doble clic para editar título"
                                    >
                                      <button
                                        type="button"
                                        className="absolute right-1 top-1 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveCategory(monthKey, cat.id); }}
                                        aria-label={`Eliminar columna ${cat.label}`}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                      {editingCategoryByMonth[monthKey] === cat.id ? (
                                        <Input
                                          autoFocus
                                          value={editingCategoryLabel}
                                          onChange={(e) => setEditingCategoryLabel(e.target.value)}
                                          onBlur={() => handleSaveCategoryTitle(monthKey, cat.id)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleSaveCategoryTitle(monthKey, cat.id); }
                                            if (e.key === 'Escape') setEditingCategoryByMonth((prev) => ({ ...prev, [monthKey]: null }));
                                          }}
                                          className="h-8 border bg-background text-center text-xs font-semibold uppercase"
                                        />
                                      ) : (
                                        <button type="button" className="w-full text-center" tabIndex={-1}>{cat.label}</button>
                                      )}
                                    </div>
                                  ))}
                                  <div className="rounded-lg border bg-muted/40 px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Nueva plataforma</div>

                                  {/* Data rows */}
                                  {weekDays.map((day, dayIndex) => (
                                    <React.Fragment key={`row-${monthKey}-${weekIndex}-${dayIndex}`}>
                                      <div className={cn('rounded-lg border px-3 py-2 text-center', day.inMonth ? 'bg-background text-foreground' : 'bg-muted/20 text-muted-foreground')}>
                                        <p className="text-xs font-semibold uppercase">{day.dayLabel}</p>
                                        <p className="text-lg font-bold">{day.dateLabel}</p>
                                        <p className="text-[10px] text-muted-foreground">{day.fullDateLabel}</p>
                                      </div>
                                      {currentYearRecords[monthKey].categories.map((cat) => (
                                        <Input
                                          key={`input-${cat.id}-${weekIndex}-${dayIndex}`}
                                          type="number"
                                          min={0}
                                          value={cat.weeks[weekIndex]?.[dayIndex] ?? 0}
                                          disabled={!day.canEdit}
                                          onChange={(e) => updateDayValue(monthKey, cat.id, weekIndex, dayIndex, e.target.value)}
                                          className={cn(
                                            'h-12 rounded-lg border text-center text-xl font-bold',
                                            day.canEdit ? 'bg-muted' : 'bg-muted/30 text-muted-foreground'
                                          )}
                                        />
                                      ))}
                                      <div className="flex items-center">
                                        {dayIndex === 6 ? (
                                          inlineCategoryInputByMonth[monthKey] ? (
                                            <Input
                                              autoFocus
                                              value={newCategoryByMonth[monthKey]}
                                              onChange={(e) => setNewCategoryByMonth((prev) => ({ ...prev, [monthKey]: e.target.value }))}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(monthKey); }
                                                if (e.key === 'Escape') setInlineCategoryInputByMonth((prev) => ({ ...prev, [monthKey]: false }));
                                              }}
                                              placeholder="Nombre"
                                              className="h-12 rounded-lg text-center font-semibold"
                                            />
                                          ) : (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="h-12 w-full text-xs font-semibold"
                                              onClick={() => setInlineCategoryInputByMonth((prev) => ({ ...prev, [monthKey]: true }))}
                                            >
                                              Nueva Plataforma
                                            </Button>
                                          )
                                        ) : (
                                          <div className="h-12 w-full rounded-lg border bg-muted/20" />
                                        )}
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </RegistryCalendarScroller>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Month summary */}
                    <Card className="mt-4 border bg-muted/10">
                      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_1fr]">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Total Online Mes</p>
                          <p className="mt-1 text-3xl font-extrabold text-primary">{monthTotal(monthKey).toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {Array.from({ length: 5 }, (_, wIdx) => (
                            <div key={`sum-${monthKey}-${wIdx}`} className="rounded-lg border bg-background p-2 text-center">
                              <p className="text-[11px] font-semibold text-muted-foreground">S{wIdx + 1}</p>
                              <p className="text-lg font-bold">{monthWeekTotal(monthKey, wIdx).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Add custom category */}
                    <Card className="mt-4 border-dashed">
                      <CardContent className="space-y-3 p-4">
                        <Input
                          value={newCategoryByMonth[monthKey]}
                          onChange={(e) => setNewCategoryByMonth((prev) => ({ ...prev, [monthKey]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(monthKey); } }}
                          placeholder='Nueva plataforma (ej. TikTok Live, Twitch…)'
                          className="h-11 rounded-xl bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Agrega una plataforma personalizada para capturar más registros.</p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full md:w-auto"
                          onClick={() => handleAddCategory(monthKey)}
                          disabled={!newCategoryByMonth[monthKey].trim()}
                        >
                          Agregar plataforma
                        </Button>
                      </CardContent>
                    </Card>
                  </CardContent>
                ) : (
                  <CardContent className="border-t p-0">
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                      <span className="rounded-full bg-primary/10 p-3 text-primary">
                        <Wifi className="h-8 w-8" />
                      </span>
                      <p className="text-3xl font-semibold">Registros en curso…</p>
                      <Button type="button" variant="outline" onClick={() => handleInitializeMonth(monthKey)}>
                        Inicializar Mes
                      </Button>
                    </div>
                  </CardContent>
                )
              ) : null}
            </Card>
          );
        })}

        {/* Annual summary */}
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-4xl font-bold">
                  <Wifi className="h-6 w-6 text-primary-foreground/80" />
                  Total Online Consolidado {selectedYear}
                </p>
                <p className="mt-2 text-xl text-slate-300">Resumen de plataformas y transmisiones activas.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 px-5 py-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Meses reportados</p>
                  <p className="mt-1 text-4xl font-extrabold">{String(monthsReported).padStart(2, '0')}/12</p>
                </div>
                <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Gran total</p>
                  <p className="mt-1 text-4xl font-extrabold">{annualGrandTotal.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-3 text-center">
                  <p className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                    Pico semanal
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-emerald-100">{annualPeakWeek.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Category cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Plataformas activas</p>
                <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold text-primary-foreground">{annualCategoryCards.length}</span>
              </div>
              {annualCategoryCards.length > 0 ? (
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                  {annualCategoryCards.map((cat) => {
                    const idLower = cat.label.toLowerCase();
                    const isYt = idLower.includes('youtube');
                    const isFb = idLower.includes('facebook');
                    const isZoom = idLower.includes('zoom');
                    return (
                      <div key={cat.label} className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5">
                        <p className="flex min-w-0 items-center gap-2 text-2xl font-bold">
                          <span className={cn(
                            'shrink-0 rounded-lg p-2',
                            isYt && 'bg-red-500/20 text-red-300',
                            isFb && 'bg-blue-500/20 text-blue-300',
                            isZoom && 'bg-sky-500/20 text-sky-300',
                            !isYt && !isFb && !isZoom && 'bg-primary-foreground/20 text-primary-foreground/80',
                          )}>
                            <Wifi className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 break-words">{cat.label}</span>
                        </p>
                        <p className="mt-3 text-5xl font-extrabold">{cat.total.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                  Inicializa un mes y agrega datos para ver el resumen por plataforma.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Floating save bar */}
        <div className="sticky bottom-0 z-10 -mx-3 flex border-t bg-background/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur min-[380px]:-mx-4 sm:-mx-8 sm:justify-end sm:px-8">
          <Button
            type="button"
            variant="default"
            disabled={isSaving || isLoadingRegistry || isImporting || !selectedChurchId || !selectedMinistryId}
            onClick={manualSave}
            className="flex-1 h-14 bg-primary text-base hover:bg-primary/90 text-primary-foreground sm:flex-none sm:w-auto sm:min-w-[280px] sm:text-lg lg:min-w-[320px] lg:text-xl"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isSaving ? 'Guardando…' : `Guardar Registro Online ${selectedYear}`}
          </Button>
        </div>
      </main>
    </div>
  );
}
