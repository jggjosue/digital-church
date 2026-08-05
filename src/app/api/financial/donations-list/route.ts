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

    const offeringFilter: Record<string, unknown> = {};
    if (yearStr) offeringFilter.year = yearStr;
    if (churchIdsScope && churchIdsScope.length > 0) {
      offeringFilter.churchId = { $in: churchIdsScope };
    }
    
    const offerings = await db.collection('offering_registry').find(offeringFilter).toArray();

    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const unifiedList: any[] = [];

    // Map regular transactions
    transactions.forEach(t => {
        unifiedList.push({
            id: t._id.toString(),
            type: 'income',
            amount: Number(t.amount) || 0,
            category: t.category || 'Sin categoría',
            fundId: t.fundId || 'Fondo General',
            reference: t.reference || 'Anónimo',
            date: t.date
        });
    });

    // Map offerings
    offerings.forEach(offering => {
        if (!offering.records) return;
        const year = parseInt(offering.year as string, 10) || new Date().getFullYear();

        Object.entries(offering.records).forEach(([monthKey, monthData]) => {
            const monthIndex = monthNames.indexOf(monthKey);
            if (monthIndex === -1) return;
            
            const categories = (monthData as any).categories || [];
            categories.forEach((category: any) => {
                const catName = category.label || 'Ofrendas';
                (category.weeks || []).forEach((week: any[], wIdx: number) => {
                    (week || []).forEach((dayAmt: string, dIdx: number) => {
                        const amt = Number(dayAmt) || 0;
                        if (amt > 0) {
                            const approxDay = Math.min(28, (wIdx * 7) + dIdx + 1);
                            const dateStr = new Date(year, monthIndex, approxDay).toISOString();
                            unifiedList.push({
                                id: `offering-${offering._id}-${monthKey}-${catName}-${wIdx}-${dIdx}`,
                                type: 'income',
                                amount: amt,
                                category: catName,
                                fundId: 'Fondo General',
                                reference: 'Ofrenda Colectada',
                                date: dateStr
                            });
                        }
                    });
                });
            });
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
