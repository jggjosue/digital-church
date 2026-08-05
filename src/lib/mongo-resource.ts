import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { Filter } from 'mongodb';
import type { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { archiveVersion, isFinancialCollection, recordAudit } from '@/lib/audit-log';

type ResourceDocument = Record<string, unknown> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ResourceConfig = {
  collection: string;
  schema: z.AnyZodObject;
  searchFields?: string[];
};

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function requireSession() {
  const { userId } = await auth();
  return userId ? null : NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
}

export function createResourceHandlers(config: ResourceConfig) {
  return {
    GET: async (request: Request) => {
      try {
        const unauthorized = await requireSession();
        if (unauthorized) return unauthorized;
        const url = new URL(request.url);
        const filter: Filter<ResourceDocument> = {};
        for (const key of ['churchId', 'status', 'year', 'category', 'type']) {
          const value = url.searchParams.get(key)?.trim();
          if (value) filter[key] = value;
        }
        const q = url.searchParams.get('q')?.trim();
        if (q && config.searchFields?.length) {
          filter.$or = config.searchFields.map((field) => ({
            [field]: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
          }));
        }
        const isAll = url.searchParams.get('all') === 'true';
        const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
        const limit = isAll ? 5000 : Math.min(500, Math.max(1, Number(url.searchParams.get('limit')) || 10));
        const skip = (page - 1) * limit;

        const db = await getDb();
        const total = await db.collection<ResourceDocument>(config.collection).countDocuments(filter);
        const items = await db.collection<ResourceDocument>(config.collection)
          .find(filter, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const totalPages = Math.ceil(total / limit) || 1;

        return NextResponse.json({ items, total, page, limit, totalPages });
      } catch (error) {
        console.error(`[api/${config.collection} GET]`, error);
        return NextResponse.json({ error: message(error, 'No se pudieron leer los registros.') }, { status: 500 });
      }
    },
    POST: async (request: Request) => {
      try {
        const unauthorized = await requireSession();
        if (unauthorized) return unauthorized;
        const parsed = config.schema.safeParse(await request.json());
        if (!parsed.success) {
          return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
        }
        const now = new Date().toISOString();
        const item: ResourceDocument = { id: randomUUID(), ...parsed.data, createdAt: now, updatedAt: now };
        const db = await getDb();
        await db.collection<ResourceDocument>(config.collection).insertOne(item);
        await recordAudit({ db, request, action: 'create', collection: config.collection, entityId: item.id, after: item });
        return NextResponse.json({ ok: true, item }, { status: 201 });
      } catch (error) {
        console.error(`[api/${config.collection} POST]`, error);
        return NextResponse.json({ error: message(error, 'No se pudo crear el registro.') }, { status: 500 });
      }
    },
  };
}

export function createResourceItemHandlers(config: ResourceConfig) {
  return {
    GET: async (_request: Request, context: { params: Promise<{ id: string }> }) => {
      try {
        const unauthorized = await requireSession();
        if (unauthorized) return unauthorized;
        const { id } = await context.params;
        const db = await getDb();
        const item = await db.collection<ResourceDocument>(config.collection).findOne({ id }, { projection: { _id: 0 } });
        return item ? NextResponse.json({ item }) : NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
      } catch (error) {
        return NextResponse.json({ error: message(error, 'No se pudo leer el registro.') }, { status: 500 });
      }
    },
    PATCH: async (request: Request, context: { params: Promise<{ id: string }> }) => {
      try {
        const unauthorized = await requireSession();
        if (unauthorized) return unauthorized;
        const { id } = await context.params;
        const parsed = config.schema.partial().safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
        const db = await getDb();
        const before = await db.collection<ResourceDocument>(config.collection).findOne({ id }, { projection: { _id: 0 } });
        if (!before) return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
        if (isFinancialCollection(config.collection)) await archiveVersion({ db, request, collection: config.collection, entityId: id, document: before, reason: 'update' });
        const result = await db.collection<ResourceDocument>(config.collection).updateOne(
          { id },
          { $set: { ...parsed.data, updatedAt: new Date().toISOString() } }
        );
        if (!result.matchedCount) return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
        const item = await db.collection<ResourceDocument>(config.collection).findOne({ id }, { projection: { _id: 0 } });
        await recordAudit({ db, request, action: 'update', collection: config.collection, entityId: id, before, after: item });
        return NextResponse.json({ ok: true, item });
      } catch (error) {
        return NextResponse.json({ error: message(error, 'No se pudo actualizar el registro.') }, { status: 500 });
      }
    },
    DELETE: async (request: Request, context: { params: Promise<{ id: string }> }) => {
      try {
        const unauthorized = await requireSession();
        if (unauthorized) return unauthorized;
        const { id } = await context.params;
        const db = await getDb();
        const before = await db.collection<ResourceDocument>(config.collection).findOne({ id }, { projection: { _id: 0 } });
        if (!before) return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
        if (isFinancialCollection(config.collection)) await archiveVersion({ db, request, collection: config.collection, entityId: id, document: before, reason: 'delete' });
        const result = await db.collection<ResourceDocument>(config.collection).deleteOne({ id });
        if (result.deletedCount) await recordAudit({ db, request, action: 'delete', collection: config.collection, entityId: id, before });
        return result.deletedCount
          ? NextResponse.json({ ok: true })
          : NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
      } catch (error) {
        return NextResponse.json({ error: message(error, 'No se pudo eliminar el registro.') }, { status: 500 });
      }
    },
  };
}
