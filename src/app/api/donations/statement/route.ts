import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { DonationDocument } from '../route';

const DONATION_COLLECTION = 'donation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId')?.trim() ?? '';
    const yearStr = searchParams.get('year')?.trim() ?? '';
    const year = Number.parseInt(yearStr, 10);

    if (!memberId) {
      return NextResponse.json({ error: 'Se requiere memberId.' }, { status: 400 });
    }
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Año inválido.' }, { status: 400 });
    }

    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();

    const db = await getDb();
    const donations = await db
      .collection<DonationDocument>(DONATION_COLLECTION)
      .find(
        {
          'donor.memberId': memberId,
          donationDate: { $gte: start, $lte: end },
        },
        { projection: { _id: 0 } }
      )
      .sort({ donationDate: 1, createdAt: 1 })
      .toArray();

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    return NextResponse.json({
      donations,
      total,
      count: donations.length,
      year,
      memberId,
    });
  } catch (e) {
    console.error('[api/donations/statement GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
