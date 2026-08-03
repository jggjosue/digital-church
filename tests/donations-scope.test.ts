import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDonationsReadScope, mergeDonationIdWithScope } from '../src/lib/donations-scope';

test('un administrador general tiene acceso abierto', () => {
  assert.deepEqual(buildDonationsReadScope({ staffRole: 'Administrador general' }, true), { kind: 'open' });
});

test('un rol de staff queda restringido a sus templos', () => {
  const scope = buildDonationsReadScope({ staffRole: 'Tesorero', churchIds: ['templo-a', 'templo-b'] }, true);
  assert.deepEqual(scope, { kind: 'scoped', filter: { churchId: { $in: ['templo-a', 'templo-b'] } } });
  assert.deepEqual(mergeDonationIdWithScope('donacion-1', scope), { $and: [{ id: 'donacion-1' }, { churchId: { $in: ['templo-a', 'templo-b'] } }] });
});

test('un congregante queda restringido por templo y por identidad de donante', () => {
  const scope = buildDonationsReadScope({ id: 'miembro-1', email: 'persona@iglesia.test', staffRole: 'Congregante', churchIds: ['templo-a'] }, true);
  assert.deepEqual(scope, { kind: 'scoped', filter: { $and: [{ churchId: { $in: ['templo-a'] } }, { $or: [{ 'donor.memberId': 'miembro-1' }, { 'donor.email': 'persona@iglesia.test' }] }] } });
});

test('un usuario enlazado sin templos no puede consultar ningún templo', () => {
  assert.deepEqual(buildDonationsReadScope({ staffRole: 'Tesorero', churchIds: [] }, true), { kind: 'scoped', filter: { churchId: '__no_church_access__' } });
});
