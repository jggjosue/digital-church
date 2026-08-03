export const REGISTRY_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

export type RegistryMonthKey = (typeof REGISTRY_MONTHS)[number];

export const REGISTRY_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

export const REGISTRY_MONTH_SHORT_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const;

export const REGISTRY_WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
export const REGISTRY_YEAR_OPTIONS = Array.from({ length: 11 }, (_, index) => String(2020 + index));

export type RegistryCategory = {
  id: string;
  label: string;
  weeks: number[][];
  isCustom?: boolean;
  paymentMethods?: Array<Array<'cash' | 'transfer' | 'check' | 'card'>>;
};

export type RegistryMonth<TCategory extends RegistryCategory = RegistryCategory> = {
  month: string;
  categories: TCategory[];
};

export type RegistryImportMode = 'replace' | 'sum';

export type RegistryImportPreviewRow = {
  rowNumber: number;
  valid: boolean;
  category?: string;
  date?: string;
  value?: number;
  duplicate?: boolean;
  reason?: string;
};

export type RegistryImportPreviewData = {
  fileName: string;
  rows: RegistryImportPreviewRow[];
  newCategories: string[];
  total: number;
};

export function createEmptyRegistryWeeks(weekCount = 6) {
  return Array.from({ length: weekCount }, () => Array.from({ length: 7 }, () => 0));
}

export function normalizeRegistryLabel(value: unknown) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function createRegistryCategoryId(label: string) {
  const normalized = normalizeRegistryLabel(label);
  const slug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria';
  const hash = Array.from(normalized).reduce(
    (value, character) => ((value * 31 + character.charCodeAt(0)) >>> 0),
    2166136261,
  );
  return `custom-${slug}-${hash.toString(36)}`;
}

export function getRegistryCalendarCell(year: number, monthIndex: number, weekIndex: number, dayIndex: number) {
  const firstOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const dateNumber = weekIndex * 7 + dayIndex - firstOffset + 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return dateNumber < 1 || dateNumber > daysInMonth ? null : new Date(year, monthIndex, dateNumber);
}

export function parseRegistryDate(value: string) {
  const normalized = value.trim();
  const dayFirst = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  const yearFirst = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  const parts = dayFirst
    ? { day: Number(dayFirst[1]), month: Number(dayFirst[2]), year: dayFirst[3].length === 2 ? 2000 + Number(dayFirst[3]) : Number(dayFirst[3]) }
    : yearFirst
      ? { day: Number(yearFirst[3]), month: Number(yearFirst[2]), year: Number(yearFirst[1]) }
      : null;
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (date.getFullYear() !== parts.year || date.getMonth() !== parts.month - 1 || date.getDate() !== parts.day) return null;
  const firstOffset = (new Date(parts.year, parts.month - 1, 1).getDay() + 6) % 7;
  return {
    year: String(parts.year),
    month: REGISTRY_MONTHS[parts.month - 1],
    weekIndex: Math.floor((firstOffset + parts.day - 1) / 7),
    dayIndex: date.getDay() === 0 ? 6 : date.getDay() - 1,
  };
}

export function registryCategoryTotal(category: RegistryCategory) {
  return category.weeks.reduce((sum, week) => sum + week.reduce((weekSum, value) => weekSum + value, 0), 0);
}

export function registryWeekTotal(categories: RegistryCategory[], weekIndex: number) {
  return categories.reduce(
    (sum, category) => sum + (category.weeks[weekIndex]?.reduce((weekSum, value) => weekSum + value, 0) ?? 0),
    0,
  );
}

export function registryMonthTotal(month: RegistryMonth) {
  return month.categories.reduce((sum, category) => sum + registryCategoryTotal(category), 0);
}

export function registryAnnualTotal<TMonth extends RegistryMonth>(records: Record<string, TMonth>, months = REGISTRY_MONTHS) {
  return months.reduce((sum, month) => sum + (records[month] ? registryMonthTotal(records[month]) : 0), 0);
}

export function registryCategoryTotals<TMonth extends RegistryMonth>(records: Record<string, TMonth>, months: readonly string[]) {
  const totals = new Map<string, { label: string; total: number }>();
  for (const month of months) {
    for (const category of records[month]?.categories ?? []) {
      const key = normalizeRegistryLabel(category.label) || category.id;
      const current = totals.get(key) ?? { label: category.label, total: 0 };
      current.total += registryCategoryTotal(category);
      totals.set(key, current);
    }
  }
  return Array.from(totals.values()).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'es'));
}

export async function readRegistrySpreadsheet(
  file: File,
  options?: { parseCsv?: (text: string) => Array<Record<string, string>> },
) {
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text();
    if (options?.parseCsv) return options.parseCsv(text);
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
    const parseLine = (line: string) => {
      const values: string[] = [];
      let current = '';
      let quoted = false;
      for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"' && line[index + 1] === '"' && quoted) { current += '"'; index += 1; }
        else if (character === '"') quoted = !quoted;
        else if (character === ',' && !quoted) { values.push(current.trim()); current = ''; }
        else current += character;
      }
      values.push(current.trim());
      return values;
    };
    const headers = parseLine(lines[0] ?? '').map(normalizeRegistryLabel);
    return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ''])));
  }
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '', raw: false });
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeRegistryLabel(key), String(value ?? '').trim()]),
  ));
}
