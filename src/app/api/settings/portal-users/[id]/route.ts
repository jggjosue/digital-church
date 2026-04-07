import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { StaffRoleDocument } from '@/lib/staff-roles';

type MemberWithPortalRole = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  portalRoleId?: string | null;
  staffRole?: string | null;
  staffRoleGrants?: {
    roleId?: string;
    name?: string;
    description?: string;
    modules?: Record<string, string[]>;
  } | null;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const memberId = id?.trim();
    if (!memberId) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const member = await db
      .collection<MemberWithPortalRole>('members')
      .findOne({ id: memberId }, { projection: { _id: 0 } });

    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado.' }, { status: 404 });
    }

    const roleId = String(member.portalRoleId ?? member.staffRoleGrants?.roleId ?? '').trim();
    let role: Pick<StaffRoleDocument, 'id' | 'name' | 'description' | 'modules'> | null = null;

    if (roleId) {
      const found = await db.collection<StaffRoleDocument>('staff_roles').findOne(
        { id: roleId },
        { projection: { _id: 0, id: 1, name: 1, description: 1, modules: 1 } }
      );
      if (found) {
        role = {
          id: found.id,
          name: found.name,
          description: found.description,
          modules: found.modules,
        };
      }
    }

    const grants = member.staffRoleGrants ?? null;
    const fallbackRole =
      grants && grants.roleId && grants.modules
        ? {
            id: String(grants.roleId),
            name: String(grants.name ?? member.staffRole ?? '').trim() || 'Rol',
            description: String(grants.description ?? '').trim(),
            modules: grants.modules,
          }
        : null;

    return NextResponse.json({
      member: {
        id: member.id,
        firstName: String(member.firstName ?? ''),
        lastName: String(member.lastName ?? ''),
        email: String(member.email ?? ''),
      },
      role: role ?? fallbackRole,
    });
  } catch (e) {
    console.error('[api/settings/portal-users/[id] GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al cargar usuario del portal.' },
      { status: 500 }
    );
  }
}
