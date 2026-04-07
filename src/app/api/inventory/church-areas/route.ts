import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  CHURCHES_COLLECTION,
  type ChurchInventoryArea,
  type ChurchLocation,
} from '@/lib/church-locations';
import {
  INVENTORY_DOC_TYPE_CHURCH_AREAS,
  type ChurchInventoryAreasDoc,
  churchInventoryAreasDocumentId,
} from '@/lib/inventory';

const COLLECTION = 'inventory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId')?.trim() ?? '';
    if (!churchId) {
      return NextResponse.json({ error: 'Falta churchId.' }, { status: 400 });
    }

    const db = await getDb();
    const doc = await db
      .collection<ChurchInventoryAreasDoc>(COLLECTION)
      .findOne(
        { docType: INVENTORY_DOC_TYPE_CHURCH_AREAS, churchId },
        { projection: { _id: 0 } }
      );

    if (!doc) {
      return NextResponse.json({ exists: false, churchId });
    }

    return NextResponse.json({
      exists: true,
      churchId: doc.churchId,
      churchName: doc.churchName,
      areas: doc.areas ?? [],
    });
  } catch (e) {
    console.error('[api/inventory/church-areas GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
    }

    const churchId = typeof body.churchId === 'string' ? body.churchId.trim() : '';
    if (!churchId) {
      return NextResponse.json({ error: 'churchId es obligatorio.' }, { status: 400 });
    }

    const db = await getDb();
    const church = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: churchId }, { projection: { _id: 0, name: 1 } });

    if (!church) {
      return NextResponse.json({ error: 'Templo no encontrado.' }, { status: 404 });
    }

    const nameFromBody =
      typeof body.churchName === 'string' ? body.churchName.trim() : '';
    const churchName = nameFromBody || church.name;

    if (!Array.isArray(body.areas)) {
      return NextResponse.json({ error: 'areas debe ser un arreglo.' }, { status: 400 });
    }

    const cleaned: ChurchInventoryArea[] = [];
    for (const raw of body.areas) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Record<string, unknown>;
      const name = typeof r.name === 'string' ? r.name.trim() : '';
      if (!name) continue;
      const aid =
        typeof r.id === 'string' && r.id.trim() ? r.id.trim() : randomUUID();
      cleaned.push({ id: aid, name });
    }

    const doc: ChurchInventoryAreasDoc = {
      docType: INVENTORY_DOC_TYPE_CHURCH_AREAS,
      id: churchInventoryAreasDocumentId(churchId),
      churchId,
      churchName,
      areas: cleaned,
      updatedAt: new Date().toISOString(),
    };

    await db.collection<ChurchInventoryAreasDoc>(COLLECTION).replaceOne(
      { docType: INVENTORY_DOC_TYPE_CHURCH_AREAS, churchId },
      doc,
      { upsert: true }
    );

    return NextResponse.json({ ok: true, doc }, { status: 201 });
  } catch (e) {
    console.error('[api/inventory/church-areas POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
