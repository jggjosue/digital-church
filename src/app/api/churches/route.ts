import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import {
  buildMapsUrlsFromAddress,
  CHURCHES_COLLECTION,
  dedupeChurchesById,
  type ChurchLocation,
} from '@/lib/church-locations';

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ churches: dedupeChurchesById(docs) });
  } catch (e) {
    console.error('[api/churches GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const createChurchFromFormSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  zip: z.string().min(1).max(32),
  country: z.enum(['usa', 'canada', 'mexico']),
  phone: z.string().max(120).optional().default(''),
  campusPastor: z.string().min(1).max(200),
  contactEmail: z.union([z.literal(''), z.string().email()]).default(''),
  description: z.string().min(1).max(8000),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createChurchFromFormSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const maps = buildMapsUrlsFromAddress({
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zip: body.zip.trim(),
      country: body.country,
    });
    const db = await getDb();
    const doc: ChurchLocation = {
      id: randomUUID(),
      name: body.name.trim(),
      address: body.address.trim(),
      municipality: body.city.trim(),
      country: body.country,
      lat: 0,
      lng: 0,
      embedUrl: maps.embedUrl,
      shareMapUrl: maps.shareMapUrl,
      phone: (body.phone ?? '').trim(),
      schedule: [],
      createdAt: new Date().toISOString(),
      city: body.city.trim(),
      state: body.state.trim(),
      zip: body.zip.trim(),
      campusPastor: body.campusPastor.trim(),
      contactEmail: body.contactEmail.trim(),
      description: body.description.trim(),
    };
    await db.collection<ChurchLocation>(CHURCHES_COLLECTION).insertOne(doc);
    return NextResponse.json(
      { ok: true, id: doc.id, message: 'Ubicación guardada correctamente.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/churches POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
