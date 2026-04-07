import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import {
  INVENTORY_RESOURCE_COLLECTION,
  RESOURCE_DOC_KIND_SYSTEM_CATEGORY,
  type ResourceSystemCategoryDoc,
} from '@/lib/inventory-resource';

/** Lista categorías base guardadas en `resource` (kind system_category). */
export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection<ResourceSystemCategoryDoc>(INVENTORY_RESOURCE_COLLECTION);
    const items = await col
      .find(
        { kind: RESOURCE_DOC_KIND_SYSTEM_CATEGORY },
        { projection: { _id: 0, id: 1, value: 1, label: 1 } }
      )
      .sort({ id: 1 })
      .toArray();

    const categories = items.map((d) => ({
      id: d.id,
      value: d.value,
      label: d.label,
    }));

    return NextResponse.json({ categories });
  } catch (e) {
    console.error('[api/resource GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
