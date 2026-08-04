import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export type MemberDonationRecord = {
  id: string;
  memberId: string;
  date: string;
  fund: string;
  type: string;
  amount: number;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection('financial_transactions')
      .find({ memberId: id.trim(), type: 'income' }, { projection: { _id: 0 } })
      .sort({ date: -1 })
      .toArray();

    // Map to MemberDonationRecord format
    const mapped = docs.map((doc: any) => ({
      id: doc.id || doc._id?.toString(),
      memberId: doc.memberId,
      date: doc.date,
      fund: doc.fundId || doc.category || 'General',
      type: doc.reference || 'Donación',
      amount: doc.amount || 0,
    }));

    return NextResponse.json({ donations: mapped });
  } catch (e) {
    console.error('[api/members/[id]/donations GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
