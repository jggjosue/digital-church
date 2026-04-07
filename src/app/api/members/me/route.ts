import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ member: null }, { status: 200 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ member: null }, { status: 200 });
    }

    const db = await getDb();
    const member = await db.collection('members').findOne(
      { email },
      {
        projection: {
          _id: 0,
          id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          address: 1,
          dob: 1,
          spiritualBirthday: 1,
          groups: 1,
          churchIds: 1,
          membershipStatus: 1,
          staffRole: 1,
        },
      }
    );

    return NextResponse.json({ member: member ?? null }, { status: 200 });
  } catch (e) {
    console.error('[api/members/me GET]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al cargar datos del miembro.' },
      { status: 500 }
    );
  }
}
