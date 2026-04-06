import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import {
  MINISTRIES_COLLECTION,
  MINISTRY_CATEGORY_VALUES,
  type MinistryDocument,
} from '@/lib/ministries';

const leaderSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
});

const updateMinistrySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(8000),
  category: z.enum(MINISTRY_CATEGORY_VALUES).optional(),
  leaders: z.array(leaderSchema).min(1),
});

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
      .collection<MinistryDocument>(MINISTRIES_COLLECTION)
      .findOne({ id: id.trim() }, { projection: { _id: 0 } });
    if (!doc) {
      return NextResponse.json({ error: 'Ministerio no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ministry: doc });
  } catch (e) {
    console.error('[api/ministries/[id] GET]', e);
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
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }
    const json = await request.json();
    const parsed = updateMinistrySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const leaders = body.leaders.map((l) => ({
      id: String(l.id),
      name: l.name.trim(),
      email: l.email.trim().toLowerCase(),
    }));
    const memberCount = leaders.length;
    const db = await getDb();
    const setPayload: Partial<MinistryDocument> = {
      name: body.name.trim(),
      description: body.description.trim(),
      leaders,
      memberCount,
    };
    if (body.category) {
      setPayload.category = body.category;
    }
    const result = await db.collection<MinistryDocument>(MINISTRIES_COLLECTION).updateOne(
      { id: id.trim() },
      {
        $set: setPayload,
      }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Ministerio no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'Ministerio actualizado correctamente.' });
  } catch (e) {
    console.error('[api/ministries/[id] PATCH]', e);
    const message =
      e instanceof Error ? e.message : 'Error al actualizar en la base de datos.';
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
    const result = await db
      .collection<MinistryDocument>(MINISTRIES_COLLECTION)
      .deleteOne({ id: id.trim() });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Ministerio no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'Ministerio eliminado correctamente.' });
  } catch (e) {
    console.error('[api/ministries/[id] DELETE]', e);
    const message =
      e instanceof Error ? e.message : 'Error al eliminar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
