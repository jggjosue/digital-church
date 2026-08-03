import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CHURCHES_COLLECTION, type ChurchLocation } from '@/lib/church-locations';
import { getDb } from '@/lib/mongodb';
import { archiveVersion, recordAudit } from '@/lib/audit-log';
import { hasPortalPermission, OFFERING_PERMISSIONS } from '@/lib/portal-permissions';

const COLLECTION = 'offering_registry';
const monthKeySchema = z.enum([
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]);
const categorySchema = z.object({
  id: z.string().min(1).max(200),
  label: z.string().min(1).max(120),
  weeks: z.array(z.array(z.number().min(0).max(1_000_000_000)).length(7)).length(6),
  isCustom: z.boolean().optional(),
  paymentMethods: z.array(z.array(z.enum(['cash', 'transfer', 'check', 'card'])).length(7)).length(6).optional(),
});
const monthSchema = z.object({
  month: z.string().min(1),
  categories: z.array(categorySchema),
});
const saveSchema = z.object({
  churchId: z.string().min(1),
  churchName: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  records: z.record(monthKeySchema, monthSchema),
  initializedMonths: z.array(monthKeySchema),
  currency: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
  bankDeposits: z.array(z.object({ id: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), amount: z.number().min(0), reference: z.string().max(200).default('') })).default([]),
});
type OfferingRegistryDoc = z.infer<typeof saveSchema> & { createdAt: string; updatedAt: string };

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const churchId = url.searchParams.get('churchId')?.trim() ?? '';
    const year = url.searchParams.get('year')?.trim() ?? '';
    if (!churchId || !/^\d{4}$/.test(year)) {
      return NextResponse.json({ error: 'churchId y year son requeridos.' }, { status: 400 });
    }
    const db = await getDb();
    if (!await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.VIEW)) return NextResponse.json({ error: 'No tienes permiso para ver ofrendas.' }, { status: 403 });
    const record = await db.collection<OfferingRegistryDoc>(COLLECTION).findOne(
      { churchId, year },
      { projection: { _id: 0 } }
    );
    return NextResponse.json({ record: record ?? null });
  } catch (error) {
    console.error('[api/donations/registro GET]', error);
    return NextResponse.json({ error: 'No se pudo leer el registro de ofrendas.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const parsed = saveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
    }
    const payload = parsed.data;
    const db = await getDb();
    if (!await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.CREATE)) return NextResponse.json({ error: 'No tienes permiso para registrar ofrendas.' }, { status: 403 });
    if (Number(payload.year) < new Date().getFullYear() && !await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.EDIT_HISTORY)) return NextResponse.json({ error: 'No tienes permiso para editar registros históricos.' }, { status: 403 });
    const operations = new Set((request.headers.get('x-registry-operation') ?? '').split(',').map((value) => value.trim()).filter(Boolean));
    if (operations.has('import') && !await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.IMPORT)) return NextResponse.json({ error: 'No tienes permiso para importar Excel.' }, { status: 403 });
    if (operations.has('delete-category') && !await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.DELETE_CATEGORIES)) return NextResponse.json({ error: 'No tienes permiso para eliminar categorías.' }, { status: 403 });
    const church = await db.collection<ChurchLocation>(CHURCHES_COLLECTION).findOne(
      { id: payload.churchId },
      { projection: { _id: 0, id: 1, name: 1 } }
    );
    if (!church || normalize(church.name) !== normalize(payload.churchName)) {
      return NextResponse.json({ error: 'El templo seleccionado no coincide con el registro.' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const entityId = `${payload.churchId}:${payload.year}`;
    const collection = db.collection<OfferingRegistryDoc>(COLLECTION);
    const existing = await collection.findOne({ churchId: payload.churchId, year: payload.year }, { projection: { _id: 0 } });
    if (existing) await archiveVersion({ db, request, collection: COLLECTION, entityId, document: existing, reason: 'update', sourceScreen: '/donations/registro' });
    await collection.updateOne(
      { churchId: payload.churchId, year: payload.year },
      {
        $set: { ...payload, churchName: church.name, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    const saved = await collection.findOne({ churchId: payload.churchId, year: payload.year }, { projection: { _id: 0 } });
    await recordAudit({ db, request, action: existing ? 'update' : 'create', collection: COLLECTION, entityId, before: existing ?? undefined, after: saved, sourceScreen: '/donations/registro' });
    return NextResponse.json({ ok: true, message: 'Registro de ofrendas guardado correctamente.' });
  } catch (error) {
    console.error('[api/donations/registro PUT]', error);
    return NextResponse.json({ error: 'No se pudo guardar el registro de ofrendas.' }, { status: 500 });
  }
}
