import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CHURCHES_COLLECTION, type ChurchLocation } from '@/lib/church-locations';
import {
  INVENTORY_CATEGORIES_COLLECTION,
  type InventoryCustomCategoryDoc,
} from '@/lib/inventory-custom-categories';
import {
  INVENTORY_DEFAULT_CATEGORY_LABEL,
  INVENTORY_DEFAULT_CATEGORY_VALUE,
  INVENTORY_DOC_TYPE_CHURCH_AREAS,
  type ChurchInventoryAreasDoc,
  type ConditionKey,
  type InventoryDoc,
  type ResourceStatus,
  buildResourceRowFromTempleArea,
} from '@/lib/inventory';
import {
  INVENTORY_RESOURCE_COLLECTION,
  RESOURCE_DOC_KIND_SYSTEM_CATEGORY,
  type ResourceSystemCategoryDoc,
} from '@/lib/inventory-resource';

const COLLECTION = 'inventory';

const CONDITIONS: ConditionKey[] = ['excellent', 'good', 'repair'];
const STATUSES: ResourceStatus[] = ['available', 'in_use', 'maintenance'];

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION);
    const raw = await collection
      .find({ docType: { $ne: INVENTORY_DOC_TYPE_CHURCH_AREAS } })
      .sort({ name: 1 })
      .toArray();

    let lastMs = 0;
    for (const doc of raw) {
      const rec = doc as Record<string, unknown> & { _id?: unknown };
      let ms = 0;
      if (typeof rec.updatedAt === 'string') {
        const t = new Date(rec.updatedAt).getTime();
        if (!Number.isNaN(t)) ms = t;
      }
      if (ms === 0 && rec._id instanceof ObjectId) {
        ms = rec._id.getTimestamp().getTime();
      }
      if (ms > lastMs) lastMs = ms;
    }
    const lastInventoryActivityAt = lastMs > 0 ? new Date(lastMs).toISOString() : null;

    const items = raw.map((doc) => {
      const { _id, ...rest } = doc as Record<string, unknown> & { _id?: unknown };
      return rest;
    }) as InventoryDoc[];

    return NextResponse.json({ items, lastInventoryActivityAt });
  } catch (e) {
    console.error('[api/inventory GET]', e);
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

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'El nombre del recurso es obligatorio.' }, { status: 400 });
    }

    const rawCategory =
      typeof body.categoryFilter === 'string' ? body.categoryFilter.trim() : '';
    const categoryFilter = rawCategory || INVENTORY_DEFAULT_CATEGORY_VALUE;

    const churchId = typeof body.churchId === 'string' ? body.churchId.trim() : '';
    const areaId = typeof body.areaId === 'string' ? body.areaId.trim() : '';
    if (!churchId || !areaId) {
      return NextResponse.json(
        { error: 'Debe seleccionar templo y ubicación (área).' },
        { status: 400 }
      );
    }

    const quantity = Number(body.quantity);
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      return NextResponse.json({ error: 'La cantidad debe ser un entero mayor o igual a 0.' }, { status: 400 });
    }

    if (typeof body.condition !== 'string' || !CONDITIONS.includes(body.condition as ConditionKey)) {
      return NextResponse.json({ error: 'Condición inválida.' }, { status: 400 });
    }
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status as ResourceStatus)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const db = await getDb();

    let categoryDisplayLabel: string | undefined;
    if (categoryFilter === INVENTORY_DEFAULT_CATEGORY_VALUE) {
      categoryDisplayLabel = INVENTORY_DEFAULT_CATEGORY_LABEL;
    } else {
      const resourceCat = await db
        .collection<ResourceSystemCategoryDoc>(INVENTORY_RESOURCE_COLLECTION)
        .findOne(
          { kind: RESOURCE_DOC_KIND_SYSTEM_CATEGORY, value: categoryFilter },
          { projection: { _id: 0, label: 1 } }
        );
      if (resourceCat?.label) {
        categoryDisplayLabel = resourceCat.label;
      } else {
        const customCat = await db
          .collection<InventoryCustomCategoryDoc>(INVENTORY_CATEGORIES_COLLECTION)
          .findOne({ value: categoryFilter }, { projection: { _id: 0, label: 1 } });
        if (!customCat) {
          return NextResponse.json({ error: 'Categoría inválida.' }, { status: 400 });
        }
        categoryDisplayLabel = customCat.label;
      }
    }

    const church = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: churchId }, { projection: { _id: 0, inventoryAreas: 1 } });

    if (!church) {
      return NextResponse.json({ error: 'Templo no encontrado.' }, { status: 404 });
    }

    const invCollection = db.collection<ChurchInventoryAreasDoc | InventoryDoc>(COLLECTION);
    const areasBundle = await invCollection.findOne(
      { docType: INVENTORY_DOC_TYPE_CHURCH_AREAS, churchId },
      { projection: { _id: 0, areas: 1 } }
    );

    let areas = areasBundle?.areas ?? [];
    if (areas.length === 0) {
      areas = church.inventoryAreas ?? [];
    }

    const area = areas.find((a) => a.id === areaId);
    if (!area) {
      return NextResponse.json(
        { error: 'El área no existe en este templo o fue eliminada.' },
        { status: 400 }
      );
    }

    const row = buildResourceRowFromTempleArea({
      name,
      categoryFilter,
      categoryDisplayLabel,
      churchId,
      areaId,
      areaName: area.name,
      quantity,
      condition: body.condition as ConditionKey,
      status: body.status as ResourceStatus,
    });

    await invCollection.insertOne(row);

    return NextResponse.json({ item: row }, { status: 201 });
  } catch (e) {
    console.error('[api/inventory POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
