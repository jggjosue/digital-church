import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  INVENTORY_CATEGORIES_COLLECTION,
  type InventoryCustomCategoryDoc,
  slugifyCategoryLabel,
} from '@/lib/inventory-custom-categories';
import { CATEGORY_OPTIONS, INVENTORY_DEFAULT_CATEGORY_VALUE } from '@/lib/inventory';

const STATIC_VALUES = new Set([
  ...CATEGORY_OPTIONS.map((c) => c.value),
  INVENTORY_DEFAULT_CATEGORY_VALUE,
]);
const MAX_STATIC_OPTION_ID = Math.max(...CATEGORY_OPTIONS.map((c) => c.id));

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection<InventoryCustomCategoryDoc>(INVENTORY_CATEGORIES_COLLECTION)
      .find({}, { projection: { _id: 0 } })
      .sort({ label: 1 })
      .toArray();
    return NextResponse.json({ categories: items });
  } catch (e) {
    console.error('[api/inventory/categories GET]', e);
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

    const label = typeof body.label === 'string' ? body.label.trim() : '';
    if (!label) {
      return NextResponse.json({ error: 'El nombre de la categoría es obligatorio.' }, { status: 400 });
    }
    if (label.length > 200) {
      return NextResponse.json({ error: 'El nombre es demasiado largo.' }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection<InventoryCustomCategoryDoc>(INVENTORY_CATEGORIES_COLLECTION);

    let baseValue = slugifyCategoryLabel(label);
    let value = baseValue;
    let suffix = 0;
    while (STATIC_VALUES.has(value) || (await col.countDocuments({ value })) > 0) {
      suffix += 1;
      value = `${baseValue}-${suffix}`;
    }

    const last = await col.findOne({}, { sort: { optionId: -1 }, projection: { optionId: 1 } });
    const optionId = Math.max(MAX_STATIC_OPTION_ID, last?.optionId ?? 0) + 1;

    const doc: InventoryCustomCategoryDoc = {
      id: randomUUID(),
      value,
      label,
      optionId,
      createdAt: new Date().toISOString(),
    };

    await col.insertOne(doc);

    return NextResponse.json({ category: doc }, { status: 201 });
  } catch (e) {
    console.error('[api/inventory/categories POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
