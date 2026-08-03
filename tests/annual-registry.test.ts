import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyRegistryWeeks,
  createRegistryCategoryId,
  parseRegistryDate,
  registryAnnualTotal,
  registryMonthTotal,
  registryWeekTotal,
} from '../src/lib/annual-registry';

test('las categorías personalizadas generan ids estables y toleran acentos', () => {
  assert.equal(createRegistryCategoryId('  Jóvenes Casados '), createRegistryCategoryId('jovenes casados'));
  assert.match(createRegistryCategoryId('Jóvenes Casados'), /^custom-jovenes-casados-/);
});

test('interpreta fechas dd/mm/aaaa y rechaza fechas imposibles', () => {
  assert.deepEqual(parseRegistryDate('01/01/2026'), { year: '2026', month: 'enero', weekIndex: 0, dayIndex: 3 });
  assert.deepEqual(parseRegistryDate('31/12/2026'), { year: '2026', month: 'diciembre', weekIndex: 4, dayIndex: 3 });
  assert.equal(parseRegistryDate('31/02/2026'), null);
});

test('calcula totales semanales, mensuales y anuales', () => {
  const weeksA = createEmptyRegistryWeeks();
  const weeksB = createEmptyRegistryWeeks();
  weeksA[0][0] = 100;
  weeksA[0][1] = 50;
  weeksB[0][0] = 25;
  weeksB[1][0] = 10;
  const enero = { month: 'Enero', categories: [{ id: 'a', label: 'A', weeks: weeksA }, { id: 'b', label: 'B', weeks: weeksB }] };
  const febrero = { month: 'Febrero', categories: [{ id: 'a', label: 'A', weeks: [[200, 0, 0, 0, 0, 0, 0], ...createEmptyRegistryWeeks(5)] }] };
  assert.equal(registryWeekTotal(enero.categories, 0), 175);
  assert.equal(registryMonthTotal(enero), 185);
  assert.equal(registryAnnualTotal({ enero, febrero }), 385);
});
