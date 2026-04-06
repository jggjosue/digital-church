import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export type MemberAttendanceRecord = {
  id: string;
  memberId: string;
  date: string;
  serviceName: string;
  status: 'Presente' | 'Ausente' | 'Justificado';
  checkInTime: string;
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
      .collection<MemberAttendanceRecord>('member_attendance')
      .find({ memberId: id.trim() }, { projection: { _id: 0 } })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ records: docs });
  } catch (e) {
    console.error('[api/members/[id]/attendance GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
