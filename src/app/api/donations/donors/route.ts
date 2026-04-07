import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { DonationDocument } from '../route';

const DONATION_COLLECTION = 'donation';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    if (q.length < 1) {
      return NextResponse.json({ donors: [] as const });
    }

    const escaped = escapeRegExp(q);
    const regex = new RegExp(escaped, 'i');

    const db = await getDb();
    const docs = await db
      .collection<DonationDocument>(DONATION_COLLECTION)
      .find(
        {
          $or: [{ 'donor.firstName': regex }, { 'donor.lastName': regex }],
        },
        { projection: { _id: 0, donor: 1 } }
      )
      .limit(120)
      .toArray();

    const seen = new Set<string>();
    const donors: {
      memberId: string;
      firstName: string;
      lastName: string;
    }[] = [];

    for (const d of docs) {
      const donor = d.donor;
      if (!donor?.memberId) continue;
      if (seen.has(donor.memberId)) continue;
      seen.add(donor.memberId);
      donors.push({
        memberId: donor.memberId,
        firstName: donor.firstName ?? '',
        lastName: donor.lastName ?? '',
      });
    }

    donors.sort((a, b) => {
      const na = `${a.lastName} ${a.firstName}`.trim();
      const nb = `${b.lastName} ${b.firstName}`.trim();
      return na.localeCompare(nb, 'es');
    });

    return NextResponse.json({ donors });
  } catch (e) {
    console.error('[api/donations/donors GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
