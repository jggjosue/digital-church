import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { isFullAccessStaffRole, isOnboardingStaffRole } from '@/lib/pastor-church-access';

type MemberRoleDoc = {
  staffRole?: string | null;
  email?: string;
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false, isNew: false, staffRole: null }, { status: 200 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ isAdmin: false, isNew: false, staffRole: null }, { status: 200 });
    }

    const db = await getDb();
    const member = await db.collection<MemberRoleDoc>('members').findOne(
      { email },
      { projection: { _id: 0, staffRole: 1 } }
    );

    const rawRole = String(member?.staffRole ?? '').trim();
    const fullAccess = isFullAccessStaffRole(member?.staffRole ?? null);
    return NextResponse.json({
      isAdmin: fullAccess,
      isNew: fullAccess ? false : isOnboardingStaffRole(member?.staffRole ?? null),
      staffRole: rawRole || null,
    });
  } catch (e) {
    console.error('[api/members/me-role GET]', e);
    return NextResponse.json({ isAdmin: false, isNew: false, staffRole: null }, { status: 200 });
  }
}
