import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { isFullAccessStaffRole, isOnboardingStaffRole } from '@/lib/pastor-church-access';
import { isSuperAdminEmail } from '@/lib/super-admin';

type MemberRoleDoc = {
  id?: string;
  staffRole?: string | null;
  email?: string;
  churchIds?: unknown;
  templeIds?: unknown;
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          isAdmin: false,
          isSuperAdmin: false,
          isNew: false,
          staffRole: null,
          memberId: null,
          clerkUserId: null,
          churchIds: [] as string[],
        },
        { status: 200 }
      );
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        {
          isAdmin: false,
          isSuperAdmin: false,
          isNew: false,
          staffRole: null,
          memberId: null,
          clerkUserId: userId,
          churchIds: [] as string[],
        },
        { status: 200 }
      );
    }

    const isSuperAdmin = isSuperAdminEmail(email);
    const db = await getDb();
    const member = await db.collection<MemberRoleDoc>('members').findOne(
      { email },
      { projection: { _id: 0, id: 1, staffRole: 1, churchIds: 1, templeIds: 1 } }
    );

    const rawRole = String(member?.staffRole ?? '').trim();
    const fullAccess = isSuperAdmin || isFullAccessStaffRole(member?.staffRole ?? null);
    const memberId =
      typeof member?.id === 'string' && member.id.trim() ? member.id.trim() : null;
    const churchIds = member
      ? normalizeMemberChurchIds(member as unknown as Record<string, unknown>)
      : [];

    const effectiveRole = isSuperAdmin
      ? 'Super Administrador'
      : rawRole || null;

    return NextResponse.json({
      isAdmin: fullAccess,
      isSuperAdmin,
      isNew: fullAccess ? false : isOnboardingStaffRole(member?.staffRole ?? null),
      staffRole: effectiveRole,
      memberId,
      clerkUserId: userId,
      churchIds,
    });
  } catch (e) {
    console.error('[api/members/me-role GET]', e);
    return NextResponse.json(
      {
        isAdmin: false,
        isSuperAdmin: false,
        isNew: false,
        staffRole: null,
        memberId: null,
        clerkUserId: null,
        churchIds: [] as string[],
      },
      { status: 200 }
    );
  }
}

