import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { isLeadershipStaffRole } from '@/lib/pastor-church-access';
import {
  CHURCHES_COLLECTION,
  dedupeChurchesById,
  type ChurchLocation,
} from '@/lib/church-locations';

/**
 * Templos (`churches`) cuyo `id` está en `members.churchIds` (y legado `templeIds`)
 * del usuario en sesión. Solo si `staffRole` es de pastoral o dirección (`isLeadershipStaffRole`).
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ churches: [] });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
    if (!email) {
      return NextResponse.json({ churches: [] });
    }

    const db = await getDb();
    const member = await db
      .collection<Record<string, unknown>>('members')
      .findOne(
        { email },
        { projection: { _id: 0, id: 1, staffRole: 1, churchIds: 1, templeIds: 1 } }
      );

    if (!member?.id || !isLeadershipStaffRole(member.staffRole as string | null | undefined)) {
      return NextResponse.json({ churches: [] });
    }

    const ids = normalizeMemberChurchIds(member);
    if (ids.length === 0) {
      return NextResponse.json({ churches: [] });
    }

    const docs = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .find({ id: { $in: ids } }, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ churches: dedupeChurchesById(docs) });
  } catch (e) {
    console.error('[api/churches/created-by-me GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
