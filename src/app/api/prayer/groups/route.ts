import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { PRAYER_GROUPS_COLLECTION, type PrayerGroupDocument } from '@/lib/prayers';

export async function GET() {
  try {
    const db = await getDb();

    // Clean up initial mock/example seed groups that have no creator email
    await db.collection(PRAYER_GROUPS_COLLECTION).deleteMany({
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: '' },
        { createdBy: null },
      ],
    });

    const groups = await db
      .collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION)
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('[API_PRAYER_GROUPS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    let creatorEmail = '';
    if (userId) {
      const user = await currentUser();
      creatorEmail = user?.primaryEmailAddress?.emailAddress ?? '';
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'El nombre del grupo es obligatorio' }, { status: 400 });
    }

    const db = await getDb();

    // Check if group already exists
    const existing = await db
      .collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION)
      .findOne({ name: { $regex: `^${name}$`, $options: 'i' } });

    if (existing) {
      return NextResponse.json({ group: existing }, { status: 200 });
    }

    const now = new Date();
    const newGroup: PrayerGroupDocument = {
      id: randomUUID(),
      name,
      description,
      createdBy: creatorEmail || 'Usuario',
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<PrayerGroupDocument>(PRAYER_GROUPS_COLLECTION).insertOne(newGroup);

    return NextResponse.json({ group: newGroup }, { status: 201 });
  } catch (error) {
    console.error('[API_PRAYER_GROUPS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
