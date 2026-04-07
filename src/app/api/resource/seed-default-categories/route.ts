import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CATEGORY_OPTIONS } from '@/lib/inventory';
import {
  INVENTORY_RESOURCE_COLLECTION,
  RESOURCE_DOC_KIND_SYSTEM_CATEGORY,
} from '@/lib/inventory-resource';

export async function POST() {
  try {
    const db = await getDb();
    const col = db.collection(INVENTORY_RESOURCE_COLLECTION);
    const now = new Date().toISOString();

    for (const opt of CATEGORY_OPTIONS) {
      await col.replaceOne(
        { kind: RESOURCE_DOC_KIND_SYSTEM_CATEGORY, value: opt.value },
        {
          kind: RESOURCE_DOC_KIND_SYSTEM_CATEGORY,
          id: opt.id,
          value: opt.value,
          label: opt.label,
          updatedAt: now,
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true, count: CATEGORY_OPTIONS.length });
  } catch (e) {
    console.error('[api/resource/seed-default-categories POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
