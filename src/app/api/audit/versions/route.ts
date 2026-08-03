import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { REGISTRY_VERSIONS_COLLECTION, FINANCIAL_VERSIONS_COLLECTION } from '@/lib/audit-log';
import { getDb } from '@/lib/mongodb';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  const db = await getDb();
  const member = email ? await db.collection('members').findOne({ email }, { projection: { staffRole: 1 } }) : null;
  if (!isFullAccessStaffRole(member?.staffRole as string | null | undefined)) return NextResponse.json({ error: 'Sin permiso para consultar versiones.' }, { status: 403 });
  const url = new URL(request.url);
  const sourceCollection = url.searchParams.get('collection')?.trim();
  const entityId = url.searchParams.get('entityId')?.trim();
  if (!sourceCollection || !entityId) return NextResponse.json({ error: 'collection y entityId son requeridos.' }, { status: 400 });
  const target = url.searchParams.get('type') === 'registry' ? REGISTRY_VERSIONS_COLLECTION : FINANCIAL_VERSIONS_COLLECTION;
  const versions = await db.collection(target).find({ sourceCollection, entityId }, { projection: { _id: 0 } }).sort({ archivedAt: -1 }).limit(100).toArray();
  return NextResponse.json({ versions });
}
