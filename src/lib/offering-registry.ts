import { createEmptyRegistryWeeks, createRegistryCategoryId, normalizeRegistryLabel, type RegistryMonthKey } from '@/lib/annual-registry';

export type OfferingPaymentMethod = 'cash' | 'transfer' | 'check' | 'card';
export type OfferingCategory = {
  id: string;
  label: string;
  weeks: number[][];
  paymentMethods?: OfferingPaymentMethod[][];
  isCustom?: boolean;
};
export type OfferingRecords = Record<RegistryMonthKey, { month: string; categories: OfferingCategory[] }>;
export type OfferingImportEntry = { month: RegistryMonthKey; week: number; day: number; label: string; amount: number; paymentMethod: OfferingPaymentMethod };

export const createOfferingPaymentMethods = () => Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => 'cash' as OfferingPaymentMethod));

export function normalizeOfferingRecords(records: OfferingRecords): OfferingRecords {
  const next = JSON.parse(JSON.stringify(records)) as OfferingRecords;
  for (const month of Object.values(next)) {
    for (const category of month.categories) category.paymentMethods ??= createOfferingPaymentMethods();
  }
  return next;
}

export function detectUnknownOfferingCategories(records: OfferingRecords, labels: string[]) {
  const known = new Set(Object.values(records).flatMap((month) => month.categories.map((category) => normalizeRegistryLabel(category.label))));
  const unknown = new Map<string, string>();
  for (const label of labels) {
    const trimmed = label.trim();
    const key = normalizeRegistryLabel(trimmed);
    if (key && !known.has(key) && !unknown.has(key)) unknown.set(key, trimmed);
  }
  return Array.from(unknown.values());
}

export function applyOfferingImportEntries(records: OfferingRecords, entries: OfferingImportEntry[], mode: 'replace' | 'sum') {
  const next = normalizeOfferingRecords(records);
  const touched = new Set<RegistryMonthKey>();
  for (const entry of entries) {
    let target = next[entry.month].categories.find((category) => normalizeRegistryLabel(category.label) === normalizeRegistryLabel(entry.label));
    if (!target) {
      target = { id: createRegistryCategoryId(entry.label), label: entry.label.trim(), weeks: createEmptyRegistryWeeks(), paymentMethods: createOfferingPaymentMethods(), isCustom: true };
      next[entry.month].categories.push(target);
    }
    target.weeks[entry.week][entry.day] = mode === 'sum' ? target.weeks[entry.week][entry.day] + entry.amount : entry.amount;
    (target.paymentMethods ??= createOfferingPaymentMethods())[entry.week][entry.day] = entry.paymentMethod;
    touched.add(entry.month);
  }
  return { records: next, touchedMonths: Array.from(touched) };
}
