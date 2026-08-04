import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import {
  PRAYERS_COLLECTION,
  createPrayerSchema,
  ensurePrayersCollection,
  type PrayerDocument,
} from '@/lib/prayers';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    await ensurePrayersCollection(db);

    const prayers = await db
      .collection<PrayerDocument>(PRAYERS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(prayers);
  } catch (error) {
    console.error('[API_PRAYERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    let userName = 'Usuario Anónimo';
    let userEmail = '';
    let userAvatar = '';

    if (userId) {
      const user = await currentUser();
      if (user) {
        userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario Desconocido';
        userEmail = user.primaryEmailAddress?.emailAddress ?? '';
        userAvatar = user.imageUrl ?? '';
      }
    }

    const body = await request.json();
    const result = createPrayerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation Error', details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    const isAnonymous = data.isAnonymous;

    const db = await getDb();
    await ensurePrayersCollection(db);

    let memberId: string | undefined;
    if (userEmail) {
      const member = await db.collection('members').findOne({ email: userEmail });
      if (member) memberId = member.id || (member as any)._id?.toString();
    }

    const newPrayer: PrayerDocument = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      privacy: data.privacy,
      isAnonymous: isAnonymous,
      status: 'Activo',
      submittedBy: isAnonymous ? 'Anónimo' : userName,
      submittedByEmail: userEmail,
      submittedByAvatar: isAnonymous ? undefined : userAvatar,
      memberId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection<PrayerDocument>(PRAYERS_COLLECTION).insertOne(newPrayer);

    return NextResponse.json(newPrayer, { status: 201 });
  } catch (error) {
    console.error('[API_PRAYERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
