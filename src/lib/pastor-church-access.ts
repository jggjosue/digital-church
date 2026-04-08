import type { Db } from 'mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';

type MemberPastorDoc = Record<string, unknown> & {
  staffRole?: string | null;
  churchIds?: string[];
  templeIds?: string[];
};

/** Solo el rol literal «Pastor» (no Pastor Regional, etc.), p. ej. al crear templos o filtrar ministerios. */
export function isExactPastorStaffRole(staffRole: string | null | undefined): boolean {
  return String(staffRole ?? '')
    .trim()
    .toLowerCase() === 'pastor';
}

/** Roles de pastor que solo deben ver templos asignados en `members.churchIds`. */
export function isPastorScopedRole(staffRole: string | null | undefined): boolean {
  const r = String(staffRole ?? '')
    .trim()
    .toLowerCase();
  if (!r) return false;
  if (r === 'pastor') return true;
  if (r.startsWith('pastor ')) return true;
  return false;
}

/** Cargos de directiva e instituto (mismos textos que en el formulario de `members`). */
const LEADERSHIP_STAFF_ROLES_EXACT = new Set([
  'directiva',
  'presidente',
  'responsable de una comisión',
  'consejo de pastores',
  'director de instituto',
]);

/**
 * Pastor titular, variantes «Pastor …» (Regional, Zona, Presbiterial, etc.) y cargos de dirección
 * que comparten reglas de templos, ministerios y botones del portal con el rol «Pastor».
 */
export function isLeadershipStaffRole(staffRole: string | null | undefined): boolean {
  if (isPastorScopedRole(staffRole)) return true;
  const r = String(staffRole ?? '').trim().toLowerCase();
  return LEADERSHIP_STAFF_ROLES_EXACT.has(r);
}

/**
 * Roles que comparten el flujo de «registrar datos» del portal (`/members/new`, `isNew` en me-role, etiqueta «Mis datos»).
 */
export function isOnboardingStaffRole(staffRole: string | null | undefined): boolean {
  const r = String(staffRole ?? '').trim().toLowerCase();
  return r === 'nuevo' || r === 'estudiante del instituto';
}

/** Mismo privilegio de alcance que `admin`: sin filtrar por templos asignados ni flujos restrictivos del portal. */
export function isFullAccessStaffRole(staffRole: string | null | undefined): boolean {
  const r = String(staffRole ?? '').trim().toLowerCase();
  if (!r) return false;
  return (
    r === 'admin' ||
    r === 'super administrador' ||
    r === 'administrador general'
  );
}

export type PastorChurchAccess =
  | { mode: 'all' }
  | { mode: 'none' }
  | { mode: 'subset'; ids: string[] };

/**
 * Resuelve si el miembro autenticado (por email) debe ver solo ciertos templos.
 * `all` = sin restricción (no es pastor con alcance restringido o sin miembro).
 * `none` = pastor sin templos asignados.
 * `subset` = lista de ids de `churches` permitidos.
 */
export async function resolvePastorChurchAccess(
  db: Db,
  email: string | null | undefined
): Promise<PastorChurchAccess> {
  const normalized = String(email ?? '')
    .trim()
    .toLowerCase();
  if (!normalized) {
    return { mode: 'all' };
  }

  const member = await db.collection<MemberPastorDoc>('members').findOne(
    { email: normalized },
    { projection: { _id: 0, staffRole: 1, churchIds: 1, templeIds: 1 } }
  );

  if (member && isFullAccessStaffRole(member.staffRole)) {
    return { mode: 'all' };
  }

  if (!member || !isLeadershipStaffRole(member.staffRole)) {
    return { mode: 'all' };
  }

  /** Ids de templos: prioridad `churchIds`, con respaldo del legado `templeIds` (mismo criterio que el resto del portal). */
  const ids = normalizeMemberChurchIds(member);

  if (ids.length === 0) {
    return { mode: 'none' };
  }

  return { mode: 'subset', ids };
}
