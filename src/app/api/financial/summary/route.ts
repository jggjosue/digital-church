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
           return NextResponse.json({ error: 'No tienes acceso a los datos financieros' }, { status: 403 });
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
    const filter: Record<string, unknown> = {};

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

    let totalDonations = 0;
    let donationsCount = 0;
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(0, i).toLocaleString('es', { month: 'short' });
        return { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), total: 0 };
    });

    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      const type = t.type as 'income' | 'expense';
      const amount = Number(t.amount) || 0;
      const category = (t.category as string) || 'Sin categoría';

      if (type === 'income') {
        incomeMap[category] = (incomeMap[category] || 0) + amount;
        totalIncome += amount;
        totalDonations += amount;
        donationsCount++;

        const date = new Date(t.date as string);
        if (!isNaN(date.getTime())) {
          monthlyData[date.getMonth()].total += amount;
        }
      } else {
        expenseMap[category] = (expenseMap[category] || 0) + amount;
        totalExpenses += amount;
      }
    }

    const income = Object.entries(incomeMap).map(([label, amount]) => ({ label, amount }));
    const expenses = Object.entries(expenseMap).map(([label, amount]) => ({ label, amount }));
    const netIncome = totalIncome - totalExpenses;
    const averageDonation = donationsCount > 0 ? totalDonations / donationsCount : 0;

    return NextResponse.json({
      totalDonations,
      averageDonation,
      monthlyData,
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netIncome
    });

  } catch (error) {
    console.error('[api/financial/summary GET]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
