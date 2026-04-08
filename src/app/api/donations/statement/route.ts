import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { getDb } from '@/lib/mongodb';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';
import type { DonationDocument } from '../route';

const DONATION_COLLECTION = 'donation';

type MemberScopeDoc = Record<string, unknown>;

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

    const { userId } = await auth();
    const scopeClauses: Record<string, unknown>[] = [];
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
      if (email) {
        const member = await db.collection<MemberScopeDoc>('members').findOne(
          { email },
          { projection: { _id: 0, churchIds: 1, templeIds: 1, staffRole: 1 } }
        );
        if (member && !isFullAccessStaffRole(member.staffRole as string | null | undefined)) {
          const churchIds = normalizeMemberChurchIds(member);
          if (churchIds.length > 0) {
            scopeClauses.push({ churchId: { $in: churchIds } });
          } else {
            scopeClauses.push({ churchId: '__no_church_access__' });
          }
        } else if (!member) {
          scopeClauses.push({ churchId: '__no_church_access__' });
        }
      } else {
        scopeClauses.push({ churchId: '__no_church_access__' });
      }
    }

    const andClauses: Record<string, unknown>[] = [
      { 'donor.memberId': memberId },
      { donationDate: { $gte: start, $lte: end } },
      ...scopeClauses,
    ];
    const filter = andClauses.length === 1 ? andClauses[0] : { $and: andClauses };

    const donations = await db
      .collection<DonationDocument>(DONATION_COLLECTION)
      .find(filter, { projection: { _id: 0 } })
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
