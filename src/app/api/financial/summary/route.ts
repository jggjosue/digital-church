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

    const offeringFilter: Record<string, unknown> = {};
    if (yearStr) offeringFilter.year = yearStr;
    if (churchIdsScope && churchIdsScope.length > 0) {
      offeringFilter.churchId = { $in: churchIdsScope };
    }
    const offerings = await db.collection('offering_registry').find(offeringFilter).toArray();

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
    const fundStats: Record<string, { inflows: number, outflows: number }> = {};

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

        if (t.fundId) {
            if (!fundStats[t.fundId as string]) fundStats[t.fundId as string] = { inflows: 0, outflows: 0 };
            fundStats[t.fundId as string].inflows += amount;
        }
      } else {
        expenseMap[category] = (expenseMap[category] || 0) + amount;
        totalExpenses += amount;

        if (t.fundId) {
            if (!fundStats[t.fundId as string]) fundStats[t.fundId as string] = { inflows: 0, outflows: 0 };
            fundStats[t.fundId as string].outflows += amount;
        }
      }
    }

    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    for (const offering of offerings) {
      if (!offering.records) continue;
      for (const [monthKey, monthData] of Object.entries(offering.records)) {
        const monthIndex = monthNames.indexOf(monthKey);
        const categories = (monthData as any).categories || [];
        for (const category of categories) {
           let categoryTotal = 0;
           for (const week of category.weeks || []) {
              for (const day of week || []) {
                 const amt = Number(day) || 0;
                 if (amt > 0) {
                    categoryTotal += amt;
                    donationsCount++;
                 }
              }
           }
           if (categoryTotal > 0) {
              const catName = category.label || 'Ofrendas';
              incomeMap[catName] = (incomeMap[catName] || 0) + categoryTotal;
              totalIncome += categoryTotal;
              totalDonations += categoryTotal;

              if (monthIndex >= 0 && monthIndex < 12) {
                 monthlyData[monthIndex].total += categoryTotal;
              }

              // Assume offerings go to Fondo General by default
              if (!fundStats['Fondo General']) fundStats['Fondo General'] = { inflows: 0, outflows: 0 };
              fundStats['Fondo General'].inflows += categoryTotal;
           }
        }
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
      netIncome,
      fundStats
    });

  } catch (error) {
    console.error('[api/financial/summary GET]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
