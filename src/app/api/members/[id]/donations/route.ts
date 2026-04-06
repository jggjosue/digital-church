import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export type MemberDonationRecord = {
  id: string;
  memberId: string;
  date: string;
  fund: string;
  type: string;
  amount: number;
  createdAt: string;
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
      .collection<MemberDonationRecord>('member_donations')
      .find({ memberId: id.trim() }, { projection: { _id: 0 } })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ donations: docs });
  } catch (e) {
    console.error('[api/members/[id]/donations GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
