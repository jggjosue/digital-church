'use client';

import * as React from 'react';
import * as XLSX from 'xlsx';
import { CalendarDays, ChevronDown, Download, Heart, Landmark, Loader2, Plus, Save, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RegistrySelector } from '@/components/annual-registry/registry-selector';
import { RegistryImportCard } from '@/components/annual-registry/registry-import-card';
import { RegistryCalendarScroller } from '@/components/annual-registry/registry-calendar-scroller';
import { RegistryCategoryAdder } from '@/components/annual-registry/registry-category-adder';
import { RegistryImportPreview } from '@/components/annual-registry/registry-import-preview';
import { RegistryDraftStatus } from '@/components/annual-registry/registry-draft-status';
import { useRegistryDraftGuard } from '@/hooks/use-registry-draft-guard';
import { usePortalPermissions } from '@/hooks/use-portal-permissions';
import { OFFERING_PERMISSIONS } from '@/lib/permission-constants';
import { CurrencyAmountInput } from '@/components/annual-registry/currency-amount-input';
import { applyOfferingImportEntries, createOfferingPaymentMethods, normalizeOfferingRecords, type OfferingImportEntry } from '@/lib/offering-registry';
import {
  REGISTRY_MONTHS, REGISTRY_MONTH_NAMES, REGISTRY_MONTH_SHORT_NAMES, REGISTRY_WEEK_DAYS,
  REGISTRY_YEAR_OPTIONS, createEmptyRegistryWeeks, createRegistryCategoryId,
  getRegistryCalendarCell, normalizeRegistryLabel, parseRegistryDate,
  readRegistrySpreadsheet,
  registryAnnualTotal, registryCategoryTotals, registryMonthTotal, registryWeekTotal,
  type RegistryImportMode, type RegistryImportPreviewData, type RegistryMonthKey,
} from '@/lib/annual-registry';

type MonthKey = RegistryMonthKey;
type PaymentMethod = 'cash' | 'transfer' | 'check' | 'card';
type CurrencyCode = 'MXN' | 'USD' | 'EUR';
type Category = { id: string; label: string; weeks: number[][]; paymentMethods?: PaymentMethod[][]; isCustom?: boolean };
type MonthRecord = { month: string; categories: Category[] };
type Records = Record<MonthKey, MonthRecord>;
type Church = { id: string; name: string };
type DonationImportEntry = OfferingImportEntry;
type DonationImportPreview = RegistryImportPreviewData & { entries: DonationImportEntry[] };
type BankDeposit = { id: string; date: string; amount: number; reference: string };

const MONTHS: MonthKey[] = [...REGISTRY_MONTHS];
const MONTH_NAMES = REGISTRY_MONTH_NAMES;
const MONTH_SHORT_NAMES = REGISTRY_MONTH_SHORT_NAMES;
const DAYS = REGISTRY_WEEK_DAYS;
const YEARS = REGISTRY_YEAR_OPTIONS;
const BASE_CATEGORIES = [
  { id: 'diezmos', label: 'Diezmos' },
  { id: 'ofrenda-general', label: 'Ofrenda General' },
  { id: 'misiones', label: 'Misiones' },
  { id: 'proyectos', label: 'Proyectos' },
];

const emptyWeeks = createEmptyRegistryWeeks;
const emptyPaymentMethods = createOfferingPaymentMethods;
const createRecords = (): Records => Object.fromEntries(MONTHS.map((key, index) => [
  key,
  { month: MONTH_NAMES[index], categories: BASE_CATEGORIES.map((category) => ({ ...category, weeks: emptyWeeks(), paymentMethods: emptyPaymentMethods() })) },
])) as Records;
const cloneRecords = (records: Records) => JSON.parse(JSON.stringify(records)) as Records;
const normalizeRecords = (records: Records) => normalizeOfferingRecords(records) as Records;
const normalize = normalizeRegistryLabel;
const categoryId = createRegistryCategoryId;

const calendarCell = getRegistryCalendarCell;

const parseDate = (value: string) => {
  const parsed = parseRegistryDate(value);
  return parsed ? { ...parsed, week: parsed.weekIndex, day: parsed.dayIndex } : null;
};

export default function OfferingRegistryPage() {
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [churches, setChurches] = React.useState<Church[]>([]);
  const [churchState, setChurchState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [churchId, setChurchId] = React.useState('');
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [records, setRecords] = React.useState<Records>(createRecords);
  const [initialized, setInitialized] = React.useState<MonthKey[]>(['enero']);
  const [expanded, setExpanded] = React.useState<MonthKey>('enero');
  const [newCategory, setNewCategory] = React.useState('');
  const [inlineCategoryTarget, setInlineCategoryTarget] = React.useState<{
    month: MonthKey;
    week: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [importPreview, setImportPreview] = React.useState<DonationImportPreview | null>(null);
  const [importMode, setImportMode] = React.useState<RegistryImportMode>('replace');
  const [importedChanges, setImportedChanges] = React.useState(false);
  const [deletedCategories, setDeletedCategories] = React.useState(false);
  const [currency, setCurrency] = React.useState<CurrencyCode>('MXN');
  const [bankDeposits, setBankDeposits] = React.useState<BankDeposit[]>([]);
  const [depositDate, setDepositDate] = React.useState('');
  const [depositAmount, setDepositAmount] = React.useState(0);
  const [depositReference, setDepositReference] = React.useState('');
  const permissions = usePortalPermissions('Ofrendas');
  const historical = Number(year) < new Date().getFullYear();
  const canEdit = permissions.can(OFFERING_PERMISSIONS.CREATE) && (!historical || permissions.can(OFFERING_PERMISSIONS.EDIT_HISTORY));
  const money = React.useCallback((value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value), [currency]);

  const churchName = churches.find((church) => church.id === churchId)?.name ?? '';
  const monthTotal = React.useCallback((key: MonthKey) => registryMonthTotal(records[key]), [records]);
  const annualTotal = React.useMemo(() => registryAnnualTotal(records), [records]);
  const depositedTotal = React.useMemo(() => bankDeposits.reduce((sum, deposit) => sum + deposit.amount, 0), [bankDeposits]);
  const reconciliationDifference = annualTotal - depositedTotal;
  const categoryTotals = React.useMemo(() => registryCategoryTotals(records, initialized), [initialized, records]);
  const monthlyPeakWeeks = React.useMemo(() => MONTHS.map((month, monthIndex) => {
    let weekIndex = 0;
    let total = 0;
    for (let week = 0; week < 6; week += 1) {
      const weekTotal = registryWeekTotal(records[month].categories, week);
      if (weekTotal > total) {
        total = weekTotal;
        weekIndex = week;
      }
    }
    const categories = records[month].categories
      .map((category) => ({
        id: category.id,
        label: category.label,
        total: category.weeks[weekIndex]?.reduce((sum, value) => sum + value, 0) ?? 0,
      }))
      .filter((category) => category.total > 0)
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'es'));
    return {
      month,
      label: MONTH_SHORT_NAMES[monthIndex],
      week: total > 0 ? weekIndex + 1 : null,
      total,
      categories,
    };
  }), [records]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/churches?sessionChurchScope=1', { cache: 'no-store' });
        const json = await response.json() as { churches?: Church[] };
        if (!response.ok) throw new Error();
        if (cancelled) return;
        const next = (json.churches ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setChurches(next);
        setChurchId(next[0]?.id ?? '');
        setChurchState('ready');
      } catch {
        if (!cancelled) setChurchState('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!churchId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const response = await fetch(`/api/donations/registro?churchId=${encodeURIComponent(churchId)}&year=${year}`, { cache: 'no-store' });
        const json = await response.json() as { record?: { records: Records; initializedMonths: MonthKey[]; currency?: CurrencyCode; bankDeposits?: BankDeposit[] } | null; error?: string };
        if (!response.ok) throw new Error(json.error);
        if (cancelled) return;
        setRecords(json.record?.records ? normalizeRecords(json.record.records) : createRecords());
        setInitialized(json.record?.initializedMonths ?? ['enero']);
        setCurrency(json.record?.currency ?? 'MXN');
        setBankDeposits(json.record?.bankDeposits ?? []);
        setExpanded(json.record?.initializedMonths?.[0] ?? 'enero');
      } catch (error) {
        if (!cancelled) toast({ variant: 'destructive', title: 'No se pudo cargar el registro', description: error instanceof Error ? error.message : undefined });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [churchId, year, toast]);

  const updateValue = (month: MonthKey, id: string, week: number, day: number, value: number) => {
    setRecords((previous) => ({ ...previous, [month]: { ...previous[month], categories: previous[month].categories.map((category) => category.id === id ? { ...category, weeks: category.weeks.map((row, rowIndex) => rowIndex === week ? row.map((amount, dayIndex) => dayIndex === day ? value : amount) : row) } : category) } }));
  };

  const updatePaymentMethod = (month: MonthKey, id: string, week: number, day: number, method: PaymentMethod) => {
    setRecords((previous) => ({ ...previous, [month]: { ...previous[month], categories: previous[month].categories.map((category) => category.id === id ? { ...category, paymentMethods: (category.paymentMethods ?? emptyPaymentMethods()).map((row, rowIndex) => rowIndex === week ? row.map((current, dayIndex) => dayIndex === day ? method : current) : row) } : category) } }));
  };

  const addCategory = (month: MonthKey) => {
    if (!canEdit) return;
    const label = newCategory.trim();
    if (!label) return;
    if (records[month].categories.some((category) => normalize(category.label) === normalize(label))) {
      toast({ variant: 'destructive', title: 'Categoría duplicada', description: `“${label}” ya existe en ${records[month].month}.` });
      return;
    }
    setRecords((previous) => ({ ...previous, [month]: { ...previous[month], categories: [...previous[month].categories, { id: categoryId(label), label, weeks: emptyWeeks(), paymentMethods: emptyPaymentMethods(), isCustom: true }] } }));
    setNewCategory('');
    setInlineCategoryTarget(null);
  };

  const removeCategory = (month: MonthKey, id: string) => {
    if (!permissions.can(OFFERING_PERMISSIONS.DELETE_CATEGORIES)) return;
    setDeletedCategories(true);
    setRecords((previous) => ({ ...previous, [month]: { ...previous[month], categories: previous[month].categories.filter((category) => category.id !== id) } }));
  };

  const save = async (silent = false): Promise<boolean> => {
    if (!churchId) return false;
    setSaving(true);
    try {
      const operations = [importedChanges ? 'import' : '', deletedCategories ? 'delete-category' : ''].filter(Boolean).join(',');
      const response = await fetch('/api/donations/registro', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(operations ? { 'x-registry-operation': operations } : {}) }, body: JSON.stringify({ churchId, churchName, year, records, initializedMonths: initialized, currency, bankDeposits }) });
      const json = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(json.error);
      if (!silent) toast({ title: 'Ofrendas guardadas', description: json.message });
      setImportedChanges(false);
      setDeletedCategories(false);
      return true;
    } catch (error) {
      if (!silent) toast({ variant: 'destructive', title: 'Error al guardar', description: error instanceof Error ? error.message : undefined });
      return false;
    } finally { setSaving(false); }
  };

  const downloadTemplate = () => {
    const rows: Array<Record<string, string | number>> = [];
    MONTHS.forEach((month, monthIndex) => records[month].categories.forEach((category) => {
      for (let week = 0; week < 6; week += 1) for (let day = 0; day < 7; day += 1) {
        const date = calendarCell(Number(year), monthIndex, week, day);
        if (date) rows.push({ iglesia: churchName, fecha: `${String(date.getDate()).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`, categoria: category.label, monto: '', moneda: currency, metodo_pago: 'efectivo' });
      }
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Ofrendas');
    XLSX.writeFile(workbook, `registro-ofrendas-${year}.xlsx`);
  };

  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = await readRegistrySpreadsheet(file);
      const existingCategories = new Set(Object.values(records).flatMap((month) => month.categories.map((category) => normalize(category.label))));
      const newCategories = new Map<string, string>();
      const seen = new Set<string>();
      const entries: DonationImportEntry[] = [];
      const paymentAliases: Record<string, PaymentMethod> = { efectivo: 'cash', cash: 'cash', transferencia: 'transfer', transfer: 'transfer', cheque: 'check', check: 'check', tarjeta: 'card', card: 'card' };
      const previewRows = rows.map((source, index) => {
        const row = source;
        const label = row.categoria || row.category || row.concepto || '';
        const amountText = row.monto || row.ofrenda || row.amount || row.valor || '';
        const dateText = row.fecha || row.date || '';
        const parsed = parseDate(dateText);
        const amount = Number(amountText.replace(/[$,\s]/g, ''));
        const rowChurch = row.iglesia || row.templo || row.church || '';
        const rowCurrency = (row.moneda || row.currency || currency).trim().toUpperCase();
        const methodText = row.metodo_pago || row.metodo || row.payment_method || 'efectivo';
        const paymentMethod = paymentAliases[normalize(methodText)];
        let reason = '';
        if (!label.trim()) reason = 'Falta la categoría.';
        else if (!parsed) reason = 'Fecha incorrecta o no reconocida.';
        else if (parsed.year !== year) reason = `La fecha no pertenece al año ${year}.`;
        else if (!amountText.trim() || Number.isNaN(amount) || amount < 0) reason = 'Cantidad incorrecta; debe ser un número mayor o igual a cero.';
        else if (rowChurch && normalize(rowChurch) !== normalize(churchName)) reason = 'El templo no coincide con el seleccionado.';
        else if (rowCurrency !== currency) reason = `La moneda ${rowCurrency} no coincide con ${currency}.`;
        else if (!paymentMethod) reason = 'Método de pago incorrecto; usa efectivo, transferencia, cheque o tarjeta.';
        if (reason || !parsed) return { rowNumber: index + 2, valid: false, category: label, date: dateText, reason };
        const key = `${parsed.month}:${parsed.week}:${parsed.day}:${normalize(label)}`;
        const existingValue = records[parsed.month].categories.find((category) => normalize(category.label) === normalize(label))?.weeks[parsed.week]?.[parsed.day] ?? 0;
        const duplicate = seen.has(key) || existingValue !== 0;
        seen.add(key);
        if (!existingCategories.has(normalize(label))) newCategories.set(normalize(label), label.trim());
        entries.push({ month: parsed.month, week: parsed.week, day: parsed.day, label: label.trim(), amount, paymentMethod });
        return { rowNumber: index + 2, valid: true, category: label.trim(), date: dateText, value: amount, duplicate };
      });
      setImportPreview({ fileName: file.name, rows: previewRows, entries, newCategories: Array.from(newCategories.values()), total: entries.reduce((sum, entry) => sum + entry.amount, 0) });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al importar', description: error instanceof Error ? error.message : undefined });
    } finally {
      setImporting(false);
    }
  };

  const closeImportPreview = () => {
    setImportPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const applyImport = () => {
    if (!importPreview) return;
    const applied = applyOfferingImportEntries(records, importPreview.entries, importMode);
    setRecords(applied.records as Records);
    setInitialized((previous) => Array.from(new Set([...previous, ...applied.touchedMonths])));
    setImportedChanges(true);
    toast({ title: 'Importación aplicada', description: `Se aplicaron ${importPreview.entries.length} ofrendas.` });
    closeImportPreview();
  };

  const draft = useRegistryDraftGuard({
    value: { records, initialized, currency, bankDeposits },
    identity: `${churchId}:${year}`,
    loading,
    onRestore: (value) => { setRecords(value.records); setInitialized(value.initialized); setCurrency(value.currency); setBankDeposits(value.bankDeposits); },
    onAutoSave: () => save(true),
  });

  const changeChurch = (value: string) => { if (draft.confirmDiscard()) setChurchId(value); };
  const changeYear = (value: string) => { if (draft.confirmDiscard()) setYear(value); };
  const manualSave = async () => { if (await save()) draft.markSaved(); };
  const addBankDeposit = () => {
    if (!canEdit || !depositDate || depositAmount <= 0) {
      toast({ variant: 'destructive', title: 'Depósito incompleto', description: 'Indica una fecha y un importe mayor a cero.' });
      return;
    }
    setBankDeposits((current) => [...current, { id: crypto.randomUUID(), date: depositDate, amount: depositAmount, reference: depositReference.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
    setDepositAmount(0);
    setDepositReference('');
  };

  if (!permissions.loading && !permissions.can(OFFERING_PERMISSIONS.VIEW)) {
    return <div className="flex flex-1 items-center justify-center p-6"><Card className="max-w-lg"><CardContent className="p-8 text-center"><Heart className="mx-auto h-10 w-10 text-muted-foreground" /><h1 className="mt-4 text-2xl font-bold">Acceso restringido</h1><p className="mt-2 text-muted-foreground">No tienes el permiso “Ver ofrendas”. Solicita acceso a un administrador.</p></CardContent></Card></div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <RegistryImportPreview preview={importPreview} mode={importMode} onModeChange={setImportMode} onCancel={closeImportPreview} onApply={applyImport} formatTotal={money} />
      <AppHeader stacked title={`Registro de Ofrendas ${year}`} description={`Control anual por categorías. Templo seleccionado: ${churchName || 'ninguno'}.`}>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <RegistrySelector churches={churches} churchId={churchId} onChurchChange={changeChurch} churchState={churchState} year={year} years={YEARS} onYearChange={changeYear} className="sm:grid-cols-2" />
          <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)} disabled={!canEdit}>
            <SelectTrigger aria-label="Moneda del registro"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="MXN">MXN · Peso mexicano</SelectItem><SelectItem value="USD">USD · Dólar</SelectItem><SelectItem value="EUR">EUR · Euro</SelectItem></SelectContent>
          </Select>
        </div>
        <RegistryDraftStatus dirty={draft.dirty} lastSavedAt={draft.lastSavedAt} autoSave={draft.autoSave} onAutoSaveChange={draft.setAutoSave} autoSaving={draft.autoSaving} onUndo={draft.undo} />
      </AppHeader>
      <main className="min-w-0 flex-1 space-y-5 bg-muted/20 p-3 pb-28 min-[380px]:p-4 min-[380px]:pb-28 sm:p-8 sm:pb-28">
        {loading ? <Card><CardContent className="flex items-center justify-center gap-2 p-10"><Loader2 className="h-5 w-5 animate-spin" /> Cargando registro...</CardContent></Card> : null}
        {!loading ? MONTHS.map((month, monthIndex) => {
          const open = expanded === month;
          const active = initialized.includes(month);
          return <Card key={month} className="overflow-hidden">
            <button type="button" className="flex w-full flex-col items-stretch justify-between gap-3 p-4 text-left min-[380px]:flex-row min-[380px]:items-center sm:gap-4 sm:p-5" onClick={() => setExpanded(month)}>
              <div className="flex items-center gap-3"><span className="rounded-full bg-primary/10 p-2 text-primary"><CalendarDays className="h-4 w-4" /></span><div><p className="text-2xl font-bold">{records[month].month}</p><p className="text-xs text-muted-foreground">{year}-{String(monthIndex + 1).padStart(2, '0')}</p></div></div>
              <div className="flex items-center justify-between gap-4 text-left min-[380px]:justify-end min-[380px]:text-right"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Total del mes</p><p className="text-xl font-bold text-primary sm:text-2xl">{money(monthTotal(month))}</p></div><ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', open && 'rotate-180')} /></div>
            </button>
            {open ? active ? <CardContent className="space-y-5 border-t p-4 sm:p-6">
              {Array.from({ length: 6 }, (_, week) => {
                const hasDays = Array.from({ length: 7 }, (_, day) => calendarCell(Number(year), monthIndex, week, day)).some(Boolean);
                if (!hasDays) return null;
                const weekTotal = records[month].categories.reduce((sum, category) => sum + category.weeks[week].reduce((a, b) => a + b, 0), 0);
                return <Card key={week}><CardContent className="space-y-3 p-3 sm:p-4"><div className="flex flex-col gap-1 min-[380px]:flex-row min-[380px]:justify-between"><p className="font-bold">Semana {week + 1}</p><p className="font-semibold text-primary">Total: {money(weekTotal)}</p></div><RegistryCalendarScroller minWidth={800}><div className="grid gap-2" style={{ gridTemplateColumns: `140px repeat(${records[month].categories.length}, minmax(130px, 1fr)) 170px` }}>
                  <div className="rounded-lg border bg-muted/40 p-2 text-center text-xs font-semibold uppercase">Día</div>
                  {records[month].categories.map((category) => <div key={category.id} className="relative rounded-lg border bg-muted/40 p-2 text-center text-xs font-semibold uppercase">{permissions.can(OFFERING_PERMISSIONS.DELETE_CATEGORIES) ? <button type="button" aria-label={`Eliminar ${category.label}`} className="absolute right-1 top-1 text-muted-foreground hover:text-destructive" onClick={() => removeCategory(month, category.id)}><XCircle className="h-4 w-4" /></button> : null}{category.label}</div>)}
                  <div className="rounded-lg border bg-muted/40 p-2 text-center text-xs font-semibold uppercase text-muted-foreground">Subtotal diario</div>
                  {Array.from({ length: 7 }, (_, day) => {
                    const date = calendarCell(Number(year), monthIndex, week, day);
                    const dayTotal = records[month].categories.reduce((sum, category) => sum + category.weeks[week][day], 0);
                    return <React.Fragment key={day}>
                      <div className={cn('rounded-lg border p-2 text-center', !date && 'bg-muted/20 text-muted-foreground')}><p className="text-xs font-semibold uppercase">{DAYS[day]}</p><p className="text-lg font-bold">{date ? String(date.getDate()).padStart(2, '0') : '--'}</p></div>
                      {records[month].categories.map((category) => <div key={category.id} className="space-y-1"><CurrencyAmountInput currency={currency} value={category.weeks[week][day]} onChange={(value) => updateValue(month, category.id, week, day, value)} disabled={!date || !canEdit} ariaLabel={`${category.label} ${date ? date.toLocaleDateString('es-MX') : 'sin fecha'}`} /><Select value={(category.paymentMethods ?? emptyPaymentMethods())[week][day]} onValueChange={(value) => updatePaymentMethod(month, category.id, week, day, value as PaymentMethod)} disabled={!date || !canEdit}><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash">Efectivo</SelectItem><SelectItem value="transfer">Transferencia</SelectItem><SelectItem value="check">Cheque</SelectItem><SelectItem value="card">Tarjeta</SelectItem></SelectContent></Select></div>)}
                      <div className="flex min-h-20 items-center justify-end rounded-lg border bg-primary/5 px-3 text-sm font-bold text-primary">{date ? money(dayTotal) : '—'}</div>
                    </React.Fragment>;
                  })}
                </div></RegistryCalendarScroller></CardContent></Card>;
              })}
              {canEdit ? <RegistryCategoryAdder value={newCategory} onChange={setNewCategory} onAdd={() => addCategory(month)} noun="categoría" /> : null}
            </CardContent> : <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 border-t"><Heart className="h-8 w-8 text-muted-foreground" /><p className="text-xl font-semibold">Mes sin inicializar</p><Button variant="outline" onClick={() => setInitialized((previous) => [...previous, month])}>Inicializar mes</Button></CardContent> : null}
          </Card>;
        }) : null}

        <Card><CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(240px,0.7fr)_1.3fr]"><div><p className="text-sm font-semibold uppercase text-muted-foreground">Total anual consolidado</p><p className="mt-2 text-4xl font-extrabold text-primary">{money(annualTotal)}</p><p className="mt-1 text-sm text-muted-foreground">{initialized.length} de 12 meses inicializados</p></div><div className="space-y-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold uppercase text-muted-foreground">Categorías activas</p><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{categoryTotals.length}</span></div>{categoryTotals.length > 0 ? <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">{categoryTotals.map((category) => <div key={normalize(category.label)} className="rounded-xl border bg-background p-4"><p className="break-words text-sm text-muted-foreground">{category.label}</p><p className="mt-1 text-xl font-bold">{money(category.total)}</p></div>)}</div> : <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Agrega o importa una categoría para mostrar su total.</div>}</div></CardContent></Card>

        <Card><CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-bold"><Landmark className="h-5 w-5 text-primary" />Conciliación bancaria</h2><p className="mt-1 text-sm text-muted-foreground">Compara las ofrendas capturadas con los depósitos registrados.</p></div><span className={cn('w-fit rounded-full px-3 py-1 text-sm font-bold', Math.abs(reconciliationDifference) < 0.01 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900')}>{Math.abs(reconciliationDifference) < 0.01 ? 'Conciliado' : `Diferencia: ${money(reconciliationDifference)}`}</span></div>
          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Ofrendas</p><p className="mt-1 text-xl font-bold">{money(annualTotal)}</p></div><div className="rounded-xl border p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Depositado</p><p className="mt-1 text-xl font-bold">{money(depositedTotal)}</p></div><div className="rounded-xl border p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Pendiente</p><p className="mt-1 text-xl font-bold">{money(reconciliationDifference)}</p></div></div>
          {canEdit ? <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-[170px_minmax(180px,1fr)_minmax(180px,1fr)_auto]"><Input type="date" aria-label="Fecha del depósito" value={depositDate} onChange={(event) => setDepositDate(event.target.value)} /><CurrencyAmountInput value={depositAmount} currency={currency} onChange={setDepositAmount} ariaLabel="Importe del depósito" /><Input aria-label="Referencia bancaria" placeholder="Referencia bancaria" value={depositReference} onChange={(event) => setDepositReference(event.target.value)} /><Button type="button" onClick={addBankDeposit}><Plus className="mr-2 h-4 w-4" />Agregar depósito</Button></div> : null}
          {bankDeposits.length ? <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[560px] text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-3">Fecha</th><th className="p-3">Referencia</th><th className="p-3 text-right">Importe</th><th className="w-12 p-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{bankDeposits.map((deposit) => <tr key={deposit.id} className="border-t"><td className="p-3">{deposit.date}</td><td className="p-3">{deposit.reference || 'Sin referencia'}</td><td className="p-3 text-right font-semibold">{money(deposit.amount)}</td><td className="p-3">{canEdit ? <Button type="button" size="icon" variant="ghost" aria-label={`Eliminar depósito ${deposit.date}`} onClick={() => setBankDeposits((current) => current.filter((item) => item.id !== deposit.id))}><Trash2 className="h-4 w-4" /></Button> : null}</td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Todavía no hay depósitos bancarios registrados.</p>}
        </CardContent></Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-50">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div>
              <p className="inline-flex items-center gap-2 text-2xl font-bold md:text-3xl">
                <CalendarDays className="h-7 w-7 text-emerald-300" aria-hidden />
                Máximo registro semanal por mes
              </p>
              <p className="mt-2 max-w-5xl text-sm leading-relaxed text-slate-400 md:text-base">
                En cada mes se muestra la semana con mayor total de ofrendas y el aporte de cada categoría, incluidas las opciones personalizadas.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {monthlyPeakWeeks.map((row) => (
                <div key={row.month} className="min-h-44 rounded-2xl border border-slate-700/70 bg-slate-900/50 p-5">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-700/70 pb-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">{row.label}</p>
                      {row.week != null ? <p className="mt-1 text-xs text-slate-500">Semana {row.week}</p> : null}
                    </div>
                    <p className="text-right text-2xl font-extrabold tabular-nums text-emerald-100">{money(row.total)}</p>
                  </div>
                  {row.categories.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {row.categories.map((category) => (
                        <li key={category.id} className="flex items-start justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words text-slate-300">{category.label}</span>
                          <span className="shrink-0 font-bold tabular-nums text-slate-100">{money(category.total)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 text-center text-sm text-slate-500">Sin datos</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {permissions.can(OFFERING_PERMISSIONS.IMPORT) ? <RegistryImportCard compact busy={importing} title="Importar ofrendas desde Excel" description="Columnas: iglesia, fecha, categoría, monto, moneda y método_pago. Se aceptan categorías personalizadas." input={<input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importFile} />} actions={<><Button type="button" onClick={() => fileRef.current?.click()} disabled={!churchId || importing}>{importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}Seleccionar Excel</Button><Button type="button" variant="outline" onClick={downloadTemplate} disabled={!churchId}><Download className="mr-2 h-4 w-4" />Descargar plantilla</Button></>} /> : null}

        <div className="sticky bottom-0 z-10 -mx-3 flex border-t bg-background/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur min-[380px]:-mx-4 sm:-mx-8 sm:justify-end sm:px-8"><Button className="w-full sm:w-auto" size="lg" onClick={() => void manualSave()} disabled={!churchId || saving || !draft.dirty || !canEdit}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar Registro {year}</Button></div>
      </main>
    </div>
  );
}
