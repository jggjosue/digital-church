import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import {
  MINISTRIES_COLLECTION,
  normalizeMinistryName,
  type MinistryDocument,
} from '@/lib/ministries';
import { BASIC_MEMBER_GROUP_OPTIONS } from '@/lib/congregante-access';

/**
 * Listado completo de ministerios para selects / checkboxes (sin filtro por iglesia ni rol).
 */
export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection(MINISTRIES_COLLECTION)
      .find({}, { projection: { _id: 1, id: 1, name: 1 } })
      .sort({ name: 1 })
      .toArray();

    const ministries = docs
      .map((d) => {
        const raw = d as Record<string, unknown>;
        const id =
          typeof raw.id === 'string' && raw.id.trim()
            ? raw.id.trim()
            : String(raw._id ?? '');
        const name = typeof raw.name === 'string' ? raw.name : '';
        return { id, name };
      })
      .filter((m) => Boolean(m.id));

    return NextResponse.json({ ministries });
  } catch (e) {
    console.error('[api/ministries/catalog GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const normalizedName = normalizeMinistryName(name);
    const builtInDuplicate = BASIC_MEMBER_GROUP_OPTIONS.find(
      (option) => normalizeMinistryName(option) === normalizedName
    );
    if (builtInDuplicate) {
      return NextResponse.json(
        { error: `“${builtInDuplicate}” ya existe. Escriba un nombre diferente.`, duplicate: true },
        { status: 409 }
      );
    }
    const db = await getDb();
    const collection = db.collection<MinistryDocument>(MINISTRIES_COLLECTION);

    await collection.createIndex(
      { normalizedName: 1 },
      {
        unique: true,
        partialFilterExpression: { normalizedName: { $type: 'string' } },
        name: 'unique_normalized_ministry_name',
      }
    );

    const candidates = await collection
      .find({}, { projection: { _id: 0, id: 1, name: 1, normalizedName: 1 } })
      .toArray();
    const duplicate = candidates.find(
      (ministry) => normalizeMinistryName(ministry.name) === normalizedName
    );
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
    const ministry: MinistryDocument = {
      id: randomUUID(),
      name,
      normalizedName,
      description: '',
      category: 'general',
      leaders: [],
      memberCount: 0,
      createdAt: new Date().toISOString(),
      ...(member?.id ? { createdByMemberId: String(member.id) } : {}),
    };

    try {
      await collection.insertOne(ministry);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        Number((error as { code?: unknown }).code) === 11000
      ) {
        return NextResponse.json(
          { error: 'Ese grupo o ministerio ya existe. Escriba un nombre diferente.', duplicate: true },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { ok: true, ministry: { id: ministry.id, name: ministry.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api/ministries/catalog POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo guardar.' },
      { status: 500 }
    );
  }
}
