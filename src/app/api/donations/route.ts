import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { CHURCHES_COLLECTION, type ChurchLocation } from '@/lib/church-locations';
import { getDb } from '@/lib/mongodb';
import { resolveDonationsReadScope } from '@/lib/donations-scope';
import { createDonationSchema, type DonationDocument } from '@/lib/donation-schema';
import { recordAudit } from '@/lib/audit-log';
import { hasPortalPermission, OFFERING_PERMISSIONS } from '@/lib/portal-permissions';

const DONATION_COLLECTION = 'donation';

const normalizeComparable = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export type { DonationDocument };

export async function GET() {
  try {
    const db = await getDb();
    if (!await hasPortalPermission(db, 'Ofrendas', OFFERING_PERMISSIONS.VIEW)) return NextResponse.json({ error: 'No tienes permiso para ver ofrendas.' }, { status: 403 });
    const scope = await resolveDonationsReadScope(db);

    let filter: Record<string, unknown> = {};
    if (scope.kind === 'open') {
      filter = {};
    } else if (scope.kind === 'none') {
      filter = { churchId: '__no_church_access__' };
    } else {
      filter = scope.filter;
    }

    const donations = await db
      .collection<DonationDocument>(DONATION_COLLECTION)
      .find(filter, { projection: { _id: 0 } })
      .sort({ donationDate: -1, createdAt: -1 })
      .toArray();

    const offeringFilter: Record<string, unknown> = {};
    if (scope.kind === 'scoped' && scope.filter && scope.filter.churchId) {
      offeringFilter.churchId = scope.filter.churchId;
    } else if (scope.kind === 'none') {
      offeringFilter.churchId = '__no_church_access__';
    }

    const offeringDocs = await db.collection('offering_registry').find(offeringFilter).toArray();
    const synthesizedOfferings: DonationDocument[] = [];

    for (const off of offeringDocs) {
      if (!off.records) continue;
      const churchName = (off.churchName as string) || 'Templo';
      for (const [monthKey, monthData] of Object.entries(off.records)) {
        const categories = (monthData as any)?.categories || [];
        for (const cat of categories) {
          let catTotal = 0;
          for (const week of cat.weeks || []) {
            for (const day of week || []) {
              catTotal += Number(day) || 0;
            }
          }
          if (catTotal > 0) {
            synthesizedOfferings.push({
              id: `offering-${off.churchId}-${off.year}-${monthKey}-${cat.id || cat.label}`,
              recordCategory: 'offering',
              donor: {
                memberId: 'offering-registry',
                firstName: 'Registro',
                lastName: 'Ofrendas',
                email: '',
                phone: '',
              },
              churchId: off.churchId as string,
              churchName: churchName,
              attendanceEvent: { id: 'service', name: `Ofrendas ${monthKey} ${off.year}` },
              amount: catTotal,
              donationDate: `${off.year}-01-01T00:00:00.000Z`,
              fundCampaign: 'general-fund',
              paymentMethod: 'cash',
              transferReference: '',
              donationFrequency: 'monthly',
              notes: `Ofrenda ${cat.label} - ${monthKey} ${off.year}`,
              createdAt: `${off.year}-01-01T00:00:00.000Z`,
              updatedAt: `${off.year}-01-01T00:00:00.000Z`,
            });
          }
        }
      }
    }

    const allItems = [...donations, ...synthesizedOfferings];
    allItems.sort((a, b) => new Date(b.donationDate || b.createdAt).getTime() - new Date(a.donationDate || a.createdAt).getTime());

    return NextResponse.json({ donations: allItems });
  } catch (e) {
    console.error('[api/donations GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createDonationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const db = await getDb();
    if (!await hasPortalPermission(db, 'Ofrendas', 'Añadir Donación')) return NextResponse.json({ error: 'No tienes permiso para añadir donaciones.' }, { status: 403 });
    const church = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: payload.churchId }, { projection: { _id: 0, id: 1, name: 1 } });

    if (!church) {
      return NextResponse.json(
        { error: 'El templo seleccionado no existe. No se puede guardar la donación.' },
        { status: 400 }
      );
    }
    if (normalizeComparable(church.name) !== normalizeComparable(payload.churchName)) {
      return NextResponse.json(
        {
          error:
            'Los datos del templo no coinciden con el registro. Vuelva a cargar la página y seleccione el templo correcto.',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const dateObj = new Date(payload.donationDate);
    const donationYear = !isNaN(dateObj.getTime())
      ? dateObj.getFullYear().toString()
      : new Date().getFullYear().toString();

    const doc: DonationDocument = {
      id: randomUUID(),
      year: donationYear,
      ...payload,
      notes: payload.notes.trim(),
      transferReference: payload.transferReference.trim(),
      donor: {
        ...payload.donor,
        email: payload.donor.email.trim(),
        phone: payload.donor.phone.trim(),
      },
      attendanceEvent: {
        id: payload.attendanceEvent.id.trim(),
        name: payload.attendanceEvent.name.trim(),
      },
      churchName: church.name,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<DonationDocument>(DONATION_COLLECTION).insertOne(doc);
    await recordAudit({ db, request, action: 'create', collection: DONATION_COLLECTION, entityId: doc.id, after: doc, sourceScreen: '/donations/new' });

    return NextResponse.json(
      {
        ok: true,
        message: 'Donación guardada correctamente.',
        donation: doc,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/donations POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
