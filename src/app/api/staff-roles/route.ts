import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { createStaffRoleBodySchema, type StaffRoleDocument } from '@/lib/staff-roles';
import { hasSettingsAccess, SETTINGS_PERMISSIONS } from '@/lib/settings-access';

const COLLECTION = 'staff_roles';

export async function GET() {
  try {
    const db = await getDb();
    if (!await hasSettingsAccess(db, SETTINGS_PERMISSIONS.LIST_ROLES) && !await hasSettingsAccess(db, SETTINGS_PERMISSIONS.MANAGE_ROLES)) return NextResponse.json({ error: 'No tienes permiso para consultar roles.' }, { status: 403 });
    const rows = await db
      .collection<StaffRoleDocument>(COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    const assigned = await db.collection('members').aggregate<{ _id: string; count: number }>([
      { $match: { portalRoleId: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$portalRoleId', count: { $sum: 1 } } },
    ]).toArray();
    const counts = new Map(assigned.map((row) => [row._id, row.count]));
    return NextResponse.json({ roles: rows.map((role) => ({ ...role, assignedUsers: counts.get(role.id) ?? 0 })) });
  } catch (e) {
    console.error('[api/staff-roles GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al leer roles.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = createStaffRoleBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, description, modules, assignToCurrentUser, assignToMemberId } = parsed.data;
    const id = randomUUID();
    const doc: StaffRoleDocument = {
      id,
      name: name.trim(),
      description: (description ?? '').trim(),
      modules,
      createdAt: new Date().toISOString(),
    };
    const db = await getDb();
    if (!await hasSettingsAccess(db, SETTINGS_PERMISSIONS.MANAGE_ROLES)) return NextResponse.json({ error: 'No tienes permiso para crear roles.' }, { status: 403 });
    const duplicate = await db.collection<StaffRoleDocument>(COLLECTION).findOne({ name: doc.name }, { collation: { locale: 'es', strength: 2 }, projection: { _id: 0, id: 1 } });
    if (duplicate) return NextResponse.json({ error: 'Ya existe un rol con ese nombre.' }, { status: 409 });
    if (assignToMemberId?.trim()) {
      const member = await db.collection('members').findOne({ id: assignToMemberId.trim() }, { projection: { _id: 1 } });
      if (!member) return NextResponse.json({ error: 'El miembro seleccionado ya no existe.' }, { status: 404 });
    }
    let currentMemberId = '';
    if (assignToCurrentUser && !assignToMemberId?.trim()) {
      const { userId } = await auth();
      const user = userId ? await currentUser() : null;
      const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
      const member = email ? await db.collection<{ id?: string }>('members').findOne({ email }, { projection: { _id: 0, id: 1 } }) : null;
      currentMemberId = String(member?.id ?? '').trim();
      if (!currentMemberId) return NextResponse.json({ error: 'No existe un miembro vinculado al correo de la sesión.' }, { status: 404 });
    }
    await db.collection<StaffRoleDocument>(COLLECTION).insertOne(doc);

    const roleSet = {
      portalRoleId: doc.id,
      staffRole: doc.name,
      staffRoleGrants: {
        roleId: doc.id,
        name: doc.name,
        description: doc.description,
        modules: doc.modules,
      },
    };

    if (assignToMemberId?.trim()) {
      await db.collection('members').updateOne({ id: assignToMemberId.trim() }, { $set: roleSet });
    } else if (currentMemberId) {
      await db.collection('members').updateOne({ id: currentMemberId }, { $set: roleSet });
    }

    return NextResponse.json(
      { ok: true, id: doc.id, role: doc, message: 'Rol guardado correctamente.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/staff-roles POST]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al guardar el rol.' },
      { status: 500 }
    );
  }
}
