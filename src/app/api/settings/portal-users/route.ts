import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';

type StaffRoleRow = { id: string; name: string };

function readRoleId(raw: Record<string, unknown>): string | null {
  const grants = raw.staffRoleGrants;
  if (
    grants &&
    typeof grants === 'object' &&
    !Array.isArray(grants) &&
    typeof (grants as { roleId?: unknown }).roleId === 'string'
  ) {
    const id = String((grants as { roleId: string }).roleId).trim();
    if (id) return id;
  }
  if (typeof raw.portalRoleId === 'string') {
    const id = raw.portalRoleId.trim();
    if (id) return id;
  }
  return null;
}

function readRoleNameFromGrants(raw: Record<string, unknown>): string | null {
  const grants = raw.staffRoleGrants;
  if (
    grants &&
    typeof grants === 'object' &&
    !Array.isArray(grants) &&
    typeof (grants as { name?: unknown }).name === 'string'
  ) {
    const name = String((grants as { name: string }).name).trim();
    if (name) return name;
  }
  return null;
}

function normalizeRole(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

/**
 * Miembros con rol de portal (`staffRoleGrants.roleId` o `portalRoleId`) y nombre de rol
 * resuelto desde `staff_roles` cuando el id coincide.
 */
export async function GET() {
  try {
    const db = await getDb();
    let sessionStaffRole = '';
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
      if (email) {
        const sessionMember = await db
          .collection<Record<string, unknown>>('members')
          .findOne({ email }, { projection: { _id: 0, staffRole: 1 } });
        sessionStaffRole = normalizeRole(
          typeof sessionMember?.staffRole === 'string' ? sessionMember.staffRole : null
        );
      }
    }

    const excludedRoles = new Set<string>(['super administrador']);

    const roleDocs = await db
      .collection<StaffRoleRow>('staff_roles')
      .find({}, { projection: { _id: 0, id: 1, name: 1 } })
      .toArray();
    const roleById = new Map(roleDocs.map((r) => [r.id, r.name]));

    const membersFilter: Record<string, unknown> =
      sessionStaffRole === 'super administrador'
        ? {}
        : {
            $or: [
              { 'staffRoleGrants.roleId': { $exists: true, $nin: [null, ''] } },
              { portalRoleId: { $exists: true, $nin: [null, ''] } },
            ],
          };

    const members = await db
      .collection('members')
      .find(membersFilter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const rows = members
      .map((raw) => {
        const m = raw as Record<string, unknown>;
        const id = typeof m.id === 'string' ? m.id : '';
        if (!id) return null;
        const linkedRoleId = readRoleId(m);
        const nameFromCatalog = linkedRoleId ? roleById.get(linkedRoleId) : undefined;
        const rawStaffRole =
          typeof m.staffRole === 'string' && m.staffRole.trim() ? m.staffRole.trim() : null;
        const grantsRoleName = readRoleNameFromGrants(m);
        const displayRole =
          sessionStaffRole === 'super administrador'
            ? rawStaffRole ?? nameFromCatalog ?? grantsRoleName ?? '—'
            : nameFromCatalog ?? grantsRoleName ?? rawStaffRole ?? '—';
        if (sessionStaffRole !== 'super administrador' && excludedRoles.has(normalizeRole(displayRole))) {
          return null;
        }

        return {
          id,
          firstName: typeof m.firstName === 'string' ? m.firstName : '',
          lastName: typeof m.lastName === 'string' ? m.lastName : '',
          email: typeof m.email === 'string' ? m.email : '',
          photoDataUrl: typeof m.photoDataUrl === 'string' ? m.photoDataUrl : null,
          staffRole: displayRole,
          portalRoleId: linkedRoleId,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);

    return NextResponse.json({ members: rows });
  } catch (e) {
    console.error('[api/settings/portal-users GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al leer usuarios del portal.' },
      { status: 500 }
    );
  }
}
