import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  CHURCHES_COLLECTION,
  normalizeChurchName,
  type ChurchLocation,
} from '@/lib/church-locations';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debe iniciar sesión.' }, { status: 401 });
    }
    const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
    const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: 'Escriba un nombre válido de hasta 200 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedName = normalizeChurchName(name);
    const db = await getDb();
    const collection = db.collection<ChurchLocation>(CHURCHES_COLLECTION);
    await collection.createIndex(
      { normalizedName: 1 },
      {
        unique: true,
        partialFilterExpression: { normalizedName: { $type: 'string' } },
        name: 'unique_normalized_church_name',
      }
    );

    const existing = await collection
      .find({}, { projection: { _id: 0, id: 1, name: 1 } })
      .toArray();
    const duplicate = existing.find((church) => normalizeChurchName(church.name) === normalizedName);
    if (duplicate) {
      return NextResponse.json(
        { error: `“${duplicate.name}” ya existe. Escriba un nombre diferente.`, duplicate: true },
        { status: 409 }
      );
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
    const member = email
      ? await db.collection<{ id?: string }>('members').findOne(
          { email },
          { projection: { _id: 0, id: 1 } }
        )
      : null;
    const id = randomUUID();
    const church: ChurchLocation = {
      id,
      name,
      normalizedName,
      profileCreated: true,
      address: '',
      municipality: '',
      country: 'mexico',
      lat: 0,
      lng: 0,
      embedUrl: '',
      shareMapUrl: '',
      phone: '',
      schedule: [],
      createdAt: new Date().toISOString(),
      city: '',
      state: '',
      zip: '',
      campusPastor: '',
      pastoralStartDate: '',
      registrationNumber: `ICIAR-${id.replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      pastoralAssignment: '',
      contactEmail: '',
      description: 'Templo agregado desde el perfil de un miembro. Datos pendientes de completar.',
      ...(member?.id ? { createdByMemberId: String(member.id) } : {}),
    };

    try {
      await collection.insertOne(church);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && Number((error as { code?: unknown }).code) === 11000) {
        return NextResponse.json(
          { error: 'Ese templo ya existe. Escriba un nombre diferente.', duplicate: true },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { ok: true, church: { id: church.id, name: church.name, municipality: '' } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api/churches/catalog POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo guardar el templo.' },
      { status: 500 }
    );
  }
}
