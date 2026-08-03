import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { staffRoleModulesSchema, type StaffRoleDocument } from '@/lib/staff-roles';
import { z } from 'zod';
import { hasSettingsAccess, SETTINGS_PERMISSIONS } from '@/lib/settings-access';

const updateStaffRoleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().default(''),
  modules: staffRoleModulesSchema,
  assignToMemberId: z.string().uuid().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const roleId = id?.trim();
    if (!roleId) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const json = await request.json().catch(() => null);
    const parsed = updateStaffRoleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, modules, assignToMemberId } = parsed.data;
    const db = await getDb();
    if (!await hasSettingsAccess(db, SETTINGS_PERMISSIONS.MANAGE_ROLES)) return NextResponse.json({ error: 'No tienes permiso para editar roles.' }, { status: 403 });

    const role = await db
      .collection<StaffRoleDocument>('staff_roles')
      .findOne({ id: roleId }, { projection: { _id: 0 } });

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado.' }, { status: 404 });
    }
    const duplicate = await db.collection<StaffRoleDocument>('staff_roles').findOne({ id: { $ne: roleId }, name: name.trim() }, { collation: { locale: 'es', strength: 2 }, projection: { _id: 0, id: 1 } });
    if (duplicate) return NextResponse.json({ error: 'Ya existe otro rol con ese nombre.' }, { status: 409 });
    if (assignToMemberId?.trim()) {
      const member = await db.collection('members').findOne({ id: assignToMemberId.trim() }, { projection: { _id: 1 } });
      if (!member) return NextResponse.json({ error: 'El miembro seleccionado ya no existe.' }, { status: 404 });
    }

    await db.collection<StaffRoleDocument>('staff_roles').updateOne(
      { id: roleId },
      {
        $set: {
          name: name.trim(),
          description: (description ?? '').trim(),
          modules,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const roleSet = {
      staffRole: name.trim(),
      staffRoleGrants: {
        roleId,
        name: name.trim(),
        description: (description ?? '').trim(),
        modules,
      },
    };

    // Mantener sincronizados los miembros que usan este portalRoleId.
    await db.collection('members').updateMany({ portalRoleId: roleId }, { $set: roleSet });

    // Opcionalmente re-asignar/forzar a un miembro específico.
    if (assignToMemberId?.trim()) {
      await db.collection('members').updateOne(
        { id: assignToMemberId.trim() },
        { $set: { portalRoleId: roleId, ...roleSet } }
      );
    }

    return NextResponse.json({ ok: true, message: 'Rol actualizado correctamente.' });
  } catch (e) {
    console.error('[api/staff-roles/[id] PATCH]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al actualizar el rol.' },
      { status: 500 }
    );
  }
}
