import test from 'node:test';
import assert from 'node:assert/strict';
import { REGISTRY_MONTHS, REGISTRY_MONTH_NAMES, createEmptyRegistryWeeks } from '../src/lib/annual-registry';
import { applyOfferingImportEntries, createOfferingPaymentMethods, detectUnknownOfferingCategories, normalizeOfferingRecords, type OfferingRecords } from '../src/lib/offering-registry';

function records(): OfferingRecords {
  return Object.fromEntries(REGISTRY_MONTHS.map((month, index) => [month, { month: REGISTRY_MONTH_NAMES[index], categories: month === 'enero' ? [{ id: 'diezmos', label: 'Diezmos', weeks: createEmptyRegistryWeeks() }] : [] }])) as OfferingRecords;
}

test('detecta categorías desconocidas sin duplicar mayúsculas o acentos', () => {
  assert.deepEqual(detectUnknownOfferingCategories(records(), ['Diezmos', 'Construcción', 'construccion', 'Misiones Especiales']), ['Construcción', 'Misiones Especiales']);
});

test('la importación crea categorías desconocidas y conserva el método de pago', () => {
  const result = applyOfferingImportEntries(records(), [{ month: 'enero', week: 0, day: 3, label: 'Construcción', amount: 450.5, paymentMethod: 'transfer' }], 'replace');
  const category = result.records.enero.categories.find((item) => item.label === 'Construcción');
  assert.equal(category?.isCustom, true);
  assert.equal(category?.weeks[0][3], 450.5);
  assert.equal(category?.paymentMethods?.[0][3], 'transfer');
  assert.deepEqual(result.touchedMonths, ['enero']);
});

test('el modo sumar no reemplaza un importe existente', () => {
  const original = records();
  original.enero.categories[0].weeks[0][0] = 100;
  const result = applyOfferingImportEntries(original, [{ month: 'enero', week: 0, day: 0, label: 'Diezmos', amount: 25, paymentMethod: 'cash' }], 'sum');
  assert.equal(result.records.enero.categories[0].weeks[0][0], 125);
});

test('los datos persisten después de serializar, recargar y normalizar un registro antiguo', () => {
  const original = records();
  original.enero.categories[0].weeks[0][0] = 99.75;
  original.enero.categories[0].paymentMethods = createOfferingPaymentMethods();
  original.enero.categories[0].paymentMethods![0][0] = 'card';
  const reloaded = normalizeOfferingRecords(JSON.parse(JSON.stringify(original)));
  assert.equal(reloaded.enero.categories[0].weeks[0][0], 99.75);
  assert.equal(reloaded.enero.categories[0].paymentMethods?.[0][0], 'card');

  const legacy = records();
  assert.equal(normalizeOfferingRecords(legacy).enero.categories[0].paymentMethods?.[0][0], 'cash');
});
