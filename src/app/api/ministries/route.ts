import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import {
  MINISTRIES_COLLECTION,
  MINISTRY_CATEGORY_VALUES,
  ensureMinistriesCollection,
  type MinistryDocument,
} from '@/lib/ministries';

const leaderSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
});

const createMinistrySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(8000).default(''),
  category: z.enum(MINISTRY_CATEGORY_VALUES).default('general'),
  leaders: z.array(leaderSchema).default([]),
});

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<MinistryDocument>(MINISTRIES_COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ ministries: docs });
  } catch (e) {
    console.error('[api/ministries GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createMinistrySchema.safeParse(json);
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
    const doc: MinistryDocument = {
      id: randomUUID(),
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category,
      leaders,
      memberCount,
      createdAt: new Date().toISOString(),
    };
    const db = await getDb();
    await ensureMinistriesCollection(db);
    await db.collection<MinistryDocument>(MINISTRIES_COLLECTION).insertOne(doc);
    return NextResponse.json(
      { ok: true, id: doc.id, message: 'Ministerio creado correctamente.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/ministries POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
