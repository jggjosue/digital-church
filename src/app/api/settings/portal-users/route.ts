import { NextResponse } from 'next/server';
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

/**
 * Miembros con rol de portal (`staffRoleGrants.roleId` o `portalRoleId`) y nombre de rol
 * resuelto desde `staff_roles` cuando el id coincide.
 */
export async function GET() {
  try {
    const db = await getDb();
    const roleDocs = await db
      .collection<StaffRoleRow>('staff_roles')
      .find({}, { projection: { _id: 0, id: 1, name: 1 } })
      .toArray();
    const roleById = new Map(roleDocs.map((r) => [r.id, r.name]));

    const members = await db
      .collection('members')
      .find(
        {
          $or: [
            { 'staffRoleGrants.roleId': { $exists: true, $nin: [null, ''] } },
            { portalRoleId: { $exists: true, $nin: [null, ''] } },
          ],
        },
        { projection: { _id: 0 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    const rows = members
      .map((raw) => {
        const m = raw as Record<string, unknown>;
        const id = typeof m.id === 'string' ? m.id : '';
        if (!id) return null;

        const linkedRoleId = readRoleId(m);
        const nameFromCatalog = linkedRoleId ? roleById.get(linkedRoleId) : undefined;
        const staffRoleFallback =
          typeof m.staffRole === 'string' && m.staffRole.trim() ? m.staffRole.trim() : null;
        const displayRole = nameFromCatalog ?? staffRoleFallback ?? '—';

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
