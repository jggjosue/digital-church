import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AUDIT_LOG_COLLECTION } from '@/lib/audit-log';
import { getDb } from '@/lib/mongodb';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  const db = await getDb();
  const member = email ? await db.collection('members').findOne({ email }, { projection: { staffRole: 1 } }) : null;
  if (!isFullAccessStaffRole(member?.staffRole as string | null | undefined)) return NextResponse.json({ error: 'Sin permiso para consultar auditoría.' }, { status: 403 });
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection')?.trim();
  const entityId = url.searchParams.get('entityId')?.trim();
  const filter: Record<string, string> = {};
  if (collection) filter.collection = collection;
  if (entityId) filter.entityId = entityId;
  const entries = await db.collection(AUDIT_LOG_COLLECTION).find(filter, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(200).toArray();
  return NextResponse.json({ entries });
}
