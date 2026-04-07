import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { createStaffRoleBodySchema, type StaffRoleDocument } from '@/lib/staff-roles';

const COLLECTION = 'staff_roles';

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db
      .collection<StaffRoleDocument>(COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ roles: rows });
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
    } else if (assignToCurrentUser) {
      const { userId } = await auth();
      if (userId) {
        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
        if (email) {
          await db.collection('members').updateOne({ email }, { $set: roleSet });
        }
      }
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
