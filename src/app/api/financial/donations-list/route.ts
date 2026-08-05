import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import {
  mongoOrMemberBelongsToChurch,
  normalizeMemberChurchIds,
} from '@/lib/member-church-ids';
import {
  isFullAccessStaffRole,
  isPastorScopedRole,
  resolvePastorChurchAccess,
} from '@/lib/pastor-church-access';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';

    const db = await getDb();

    const sessionMember = await db.collection<Record<string, unknown>>('members').findOne(
      { email },
      { projection: { _id: 0, staffRole: 1, churchIds: 1, templeIds: 1 } }
    );

    let churchIdsScope: string[] | null = null;
    if (sessionMember && !isFullAccessStaffRole(sessionMember.staffRole as string | null | undefined)) {
      let ids = normalizeMemberChurchIds(sessionMember);
      if (isPastorScopedRole(sessionMember.staffRole as string | null | undefined)) {
        const access = await resolvePastorChurchAccess(db, email);
        if (access.mode === 'none') {
          return NextResponse.json({ error: 'No tienes acceso a los datos' }, { status: 403 });
        }
        if (access.mode === 'subset') {
          ids = access.ids;
        }
      }
      if (ids.length === 0) {
        return NextResponse.json({ error: 'No tienes iglesias asignadas' }, { status: 403 });
      }
      churchIdsScope = ids;
    }

    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const filter: Record<string, unknown> = { type: 'income' };

    if (yearStr) {
      filter.date = {
        $gte: `${yearStr}-01-01`,
        $lte: `${yearStr}-12-31T23:59:59.999Z`
      };
    }

    if (churchIdsScope && churchIdsScope.length > 0) {
      filter.churchId = { $in: churchIdsScope };
    }

    const transactions = await db.collection('financial_transactions')
      .find(filter)
      .toArray();

    const donationFilter: Record<string, unknown> = {};
    if (yearStr) {
      donationFilter.$or = [
        { year: yearStr },
        { donationDate: { $regex: `^${yearStr}` } }
      ];
    }
    if (churchIdsScope && churchIdsScope.length > 0) {
      donationFilter.churchId = { $in: churchIdsScope };
    }

    const donationsDocs = await db.collection('donation')
      .find(donationFilter)
      .toArray();

    const unifiedList: any[] = [];

    // Map donations from 'donation' collection (Menú Donaciones)
    donationsDocs.forEach(d => {
      const donorName = d.donor ? `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim() : '';
      unifiedList.push({
        id: d.id || d._id?.toString(),
        type: 'income',
        amount: Number(d.amount) || 0,
        category: d.recordCategory || 'Donación',
        fundId: d.fundCampaign || 'Fondo General',
        reference: donorName || d.transferReference || 'Donante',
        date: d.donationDate || d.createdAt || new Date().toISOString()
      });
    });

    // Map regular transactions of type income
    transactions.forEach(t => {
      unifiedList.push({
        id: t._id.toString(),
        type: 'income',
        amount: Number(t.amount) || 0,
        category: t.category || 'Donación',
        fundId: t.fundId || 'Fondo General',
        reference: t.reference || 'Anónimo',
        date: t.date
      });
    });

    unifiedList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = unifiedList.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedItems = unifiedList.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      items: paginatedItems,
      total,
      totalPages,
      page,
      limit
    });

  } catch (error) {
    console.error('[api/financial/donations-list GET]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
