import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  CHURCHES_COLLECTION,
  type ChurchInventoryArea,
  type ChurchLocation,
} from '@/lib/church-locations';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }
    const db = await getDb();
    const doc = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: id.trim() }, { projection: { _id: 0 } });
    if (!doc) {
      return NextResponse.json({ error: 'Ubicación no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ church: doc });
  } catch (e) {
    console.error('[api/churches/[id] GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const trimmed = id?.trim() ?? '';
    if (!trimmed) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
    }

    if (!Array.isArray(body.inventoryAreas)) {
      return NextResponse.json(
        { error: 'Se requiere el arreglo inventoryAreas.' },
        { status: 400 }
      );
    }

    const cleaned: ChurchInventoryArea[] = [];
    for (const raw of body.inventoryAreas) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Record<string, unknown>;
      const name = typeof r.name === 'string' ? r.name.trim() : '';
      if (!name) continue;
      const aid =
        typeof r.id === 'string' && r.id.trim() ? r.id.trim() : randomUUID();
      cleaned.push({ id: aid, name });
    }

    const db = await getDb();
    const result = await db.collection<ChurchLocation>(CHURCHES_COLLECTION).updateOne(
      { id: trimmed },
      { $set: { inventoryAreas: cleaned } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Ubicación no encontrada.' }, { status: 404 });
    }

    const doc = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: trimmed }, { projection: { _id: 0 } });

    return NextResponse.json({ church: doc });
  } catch (e) {
    console.error('[api/churches/[id] PATCH]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection(CHURCHES_COLLECTION).deleteOne({
      id: id.trim(),
    });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Ubicación no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'Ubicación eliminada.' });
  } catch (e) {
    console.error('[api/churches/[id] DELETE]', e);
    const message =
      e instanceof Error ? e.message : 'Error al eliminar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
