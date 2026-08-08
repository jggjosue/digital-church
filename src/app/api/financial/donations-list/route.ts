import { NextResponse } from 'next/server';
import { isCongreganteAccessRole } from '@/lib/congregante-access';
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

    if (sessionMember) {
      const sr = String(sessionMember.staffRole ?? '').trim().toLowerCase();
      if (isCongreganteAccessRole(sr)) {
        return NextResponse.json({ error: 'No tienes acceso a los datos financieros.' }, { status: 403 });
      }
    }

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
    const fund = searchParams.get('fund')?.trim();
    const campaign = searchParams.get('campaign')?.trim();
    const search = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const clauses: Record<string, unknown>[] = [];
    if (yearStr) {
      clauses.push({ $or: [
        { year: yearStr },
        { donationDate: { $regex: `^${yearStr}` } }
      ] });
    }
    if (churchIdsScope && churchIdsScope.length > 0) {
      clauses.push({ churchId: { $in: churchIdsScope } });
    }
    if (fund && fund !== 'all') clauses.push({ fundCampaign: fund });
    if (campaign && campaign !== 'all') clauses.push({ fundraisingCampaignId: campaign });
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      clauses.push({
        $or: [
          { 'donor.firstName': { $regex: escaped, $options: 'i' } },
          { 'donor.lastName': { $regex: escaped, $options: 'i' } },
          { transferReference: { $regex: escaped, $options: 'i' } },
          { fundraisingCampaignName: { $regex: escaped, $options: 'i' } },
        ],
      });
    }
    const donationFilter: Record<string, unknown> = clauses.length > 0 ? { $and: clauses } : {};

    const donationsDocs = await db.collection('donation')
      .find(donationFilter)
      .toArray();

    const unifiedList: any[] = [];

    // Map items strictly from 'donation' collection
    donationsDocs.forEach(d => {
      const donorName = d.donor ? `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim() : '';
      unifiedList.push({
        id: d.id || d._id?.toString(),
        type: 'income',
        amount: Number(d.amount) || 0,
        category: d.recordCategory || 'Donación',
        fundId: d.fundCampaign || 'Fondo General',
        reference: donorName || d.transferReference || 'Donante',
        campaignId: d.fundraisingCampaignId || '',
        campaignName: d.fundraisingCampaignName || '',
        date: d.donationDate || d.createdAt || new Date().toISOString()
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
