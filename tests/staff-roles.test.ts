import test from 'node:test';
import assert from 'node:assert/strict';
import { PORTAL_PERMISSIONS_BY_MODULE } from '../src/lib/portal-nav-data';
import { createStaffRoleBodySchema } from '../src/lib/staff-roles';

test('el catálogo no contiene módulos ni permisos duplicados', () => {
  const modules = Object.keys(PORTAL_PERMISSIONS_BY_MODULE);
  assert.equal(new Set(modules).size, modules.length);
  for (const [module, permissions] of Object.entries(PORTAL_PERMISSIONS_BY_MODULE)) {
    assert.equal(new Set(permissions).size, permissions.length, `Permisos duplicados en ${module}`);
  }
});

test('acepta un rol con permisos conocidos', () => {
  const result = createStaffRoleBodySchema.safeParse({ name: 'Secretaría', modules: { Directorio: ['Miembros'] } });
  assert.equal(result.success, true);
});

test('rechaza módulos, permisos y valores duplicados desconocidos', () => {
  assert.equal(createStaffRoleBodySchema.safeParse({ name: 'X', modules: { Desconocido: ['Leer'] } }).success, false);
  assert.equal(createStaffRoleBodySchema.safeParse({ name: 'X', modules: { Configuración: ['Borrar todo'] } }).success, false);
  assert.equal(createStaffRoleBodySchema.safeParse({ name: 'X', modules: { Configuración: ['Usuarios', 'Usuarios'] } }).success, false);
});
