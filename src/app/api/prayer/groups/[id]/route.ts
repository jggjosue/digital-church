import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { PRAYER_GROUPS_COLLECTION, type PrayerGroupDocument } from '@/lib/prayers';

async function resolveId(context: { params: Promise<{ id: string }> }): Promise<string> {
  const resolved = await context.params;
  return resolved?.id?.trim() ?? '';
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ error: 'Id de grupo inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'El nombre del grupo es obligatorio.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION).updateOne(
      { id },
      {
        $set: {
          name,
          description,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Grupo de oración no encontrado.' }, { status: 404 });
    }

    const updatedGroup = await db
      .collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION)
      .findOne({ id }, { projection: { _id: 0 } });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('[API_PRAYER_GROUPS_PUT]', error);
    return NextResponse.json({ error: 'Error al actualizar el grupo.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ error: 'Id de grupo inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION).deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Grupo de oración no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Grupo eliminado correctamente.' });
  } catch (error) {
    console.error('[API_PRAYER_GROUPS_DELETE]', error);
    return NextResponse.json({ error: 'Error al eliminar el grupo.' }, { status: 500 });
  }
}
