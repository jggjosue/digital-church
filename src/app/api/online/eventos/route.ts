import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/mongodb';

const ONLINE_EVENTS_COLLECTION = 'online_events';

const createEventSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  category: z.string().min(1).max(100),
  description: z.string().max(1000).optional().default(''),
  platform: z.string().min(1).max(100),
  scheduledAt: z.string().min(1, 'La fecha y hora son requeridas'),
  recurrence: z.enum(['once', 'weekly', 'biweekly', 'monthly', 'concurrent']).default('once'),
  weekday: z.string().max(20).optional().default(''),
  weekdays: z.array(z.string().max(20)).default([]),
  meetingLink: z.string().url('Link inválido').max(500).optional().or(z.literal('')).default(''),
  participatingChurches: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
    })
  ).default([]),
  notes: z.string().max(1000).optional().default(''),
});

type OnlineEvent = z.infer<typeof createEventSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('q')?.trim() ?? '';
    const singleId = url.searchParams.get('id')?.trim() ?? '';

    const db = await getDb();
    const filter: Record<string, unknown> = {};

    if (singleId) {
      filter.id = singleId;
    } else if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { category: regex }, { description: regex }];
    }

    const events = await db
      .collection<OnlineEvent>(ONLINE_EVENTS_COLLECTION)
      .find(filter, { projection: { _id: 0 } })
      .sort({ scheduledAt: -1, createdAt: -1 })
      .limit(singleId ? 1 : 100)
      .toArray();

    return NextResponse.json({ events });
  } catch (e) {
    console.error('[api/online/eventos GET]', e);
    return NextResponse.json({ error: 'Error al cargar eventos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createEventSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newEvent: OnlineEvent = {
      ...parsed.data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    await db.collection(ONLINE_EVENTS_COLLECTION).insertOne({ ...newEvent });

    return NextResponse.json({ ok: true, event: newEvent, message: 'Evento online creado correctamente.' }, { status: 201 });
  } catch (e) {
    console.error('[api/online/eventos POST]', e);
    return NextResponse.json({ error: 'Error al crear el evento.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.trim() ?? '';
    if (!id) {
      return NextResponse.json({ error: 'id es requerido.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection(ONLINE_EVENTS_COLLECTION).deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Evento eliminado correctamente.' });
  } catch (e) {
    console.error('[api/online/eventos DELETE]', e);
    return NextResponse.json({ error: 'Error al eliminar el evento.' }, { status: 500 });
  }
}
