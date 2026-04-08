import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { getDb } from '@/lib/mongodb';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';
import type { DonationDocument } from '../route';

const DONATION_COLLECTION = 'donation';

type MemberScopeDoc = Record<string, unknown> & {
  email?: string;
};

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
      { $or: [{ 'donor.firstName': regex }, { 'donor.lastName': regex }] },
      ...scopeClauses,
    ];

    const filter = andClauses.length === 1 ? andClauses[0] : { $and: andClauses };

    const docs = await db
      .collection<DonationDocument>(DONATION_COLLECTION)
      .find(filter, { projection: { _id: 0, donor: 1 } })
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
