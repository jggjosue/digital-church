import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import {
  isFullAccessStaffRole,
  isLeadershipStaffRole,
} from '@/lib/pastor-church-access';
import {
  CHURCHES_COLLECTION,
  type ChurchLocation,
} from '@/lib/church-locations';
import {
  MINISTRIES_COLLECTION,
  MINISTRY_CATEGORY_VALUES,
  ensureMinistriesCollection,
  normalizeMinistryName,
  type MinistryDocument,
} from '@/lib/ministries';
import { BASIC_MEMBER_GROUP_OPTIONS } from '@/lib/congregante-access';

const leaderSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
});

const createMinistrySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(8000).default(''),
  category: z.enum(MINISTRY_CATEGORY_VALUES).default('general'),
  leaders: z.array(leaderSchema).default([]),
  /** `churches.id` de un templo asignado al pastor en `members.churchIds`. */
  churchId: z.string().min(1).max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const catalog =
      new URL(request.url).searchParams.get('catalog') === '1' ||
      new URL(request.url).searchParams.get('catalog') === 'true';

    let mongoFilter: Record<string, unknown> = {};
    if (!catalog) {
      const { userId } = await auth();
      if (userId) {
        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
        if (!email) {
          return NextResponse.json({ ministries: [] });
        }
        const member = await db.collection<{ id: string }>('members').findOne(
          { email },
          { projection: { _id: 0, id: 1 } }
        );

        if (!member?.id) {
          return NextResponse.json({ ministries: [] });
        }

        mongoFilter = { createdByMemberId: member.id };
      }
    }

    const projection = catalog ? { _id: 0, id: 1, name: 1 } : { _id: 0 };

    const docs = await db
      .collection<MinistryDocument>(MINISTRIES_COLLECTION)
      .find(mongoFilter, { projection })
      .sort({ name: 1 })
      .toArray();

    // Resolve church names for ministries that have a churchId
    if (!catalog) {
      const churchIds = [...new Set(docs.map((d) => d.churchId).filter(Boolean))] as string[];
      if (churchIds.length > 0) {
        const churches = await db
          .collection<{ id: string; name: string }>(CHURCHES_COLLECTION)
          .find({ id: { $in: churchIds } }, { projection: { _id: 0, id: 1, name: 1 } })
          .toArray();
        const churchNameMap = new Map(churches.map((c) => [c.id, c.name]));
        for (const doc of docs) {
          if (doc.churchId) {
            doc.churchName = churchNameMap.get(doc.churchId);
          }
        }
      }
    }

    return NextResponse.json({ ministries: docs });
  } catch (e) {
    console.error('[api/ministries GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createMinistrySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;
    let leaders = body.leaders.map((l) => ({
      id: String(l.id),
      name: l.name.trim(),
      email: l.email.trim().toLowerCase(),
    }));

    const db = await getDb();
    await ensureMinistriesCollection(db);
    const normalizedName = normalizeMinistryName(body.name);
    const builtInDuplicate = BASIC_MEMBER_GROUP_OPTIONS.find(
      (option) => normalizeMinistryName(option) === normalizedName
    );
    if (builtInDuplicate) {
      return NextResponse.json(
        { error: `“${builtInDuplicate}” ya existe. Escriba un nombre diferente.` },
        { status: 409 }
      );
    }
    const ministriesCollection = db.collection<MinistryDocument>(MINISTRIES_COLLECTION);
    await ministriesCollection.createIndex(
      { normalizedName: 1 },
      {
        unique: true,
        partialFilterExpression: { normalizedName: { $type: 'string' } },
        name: 'unique_normalized_ministry_name',
      }
    );
    const existingNames = await ministriesCollection
      .find({}, { projection: { _id: 0, name: 1 } })
      .toArray();
    const duplicate = existingNames.find(
      (ministry) => normalizeMinistryName(ministry.name) === normalizedName
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `“${duplicate.name}” ya existe. Escriba un nombre diferente.` },
        { status: 409 }
      );
    }

    const churchIdRaw = body.churchId?.trim() ?? '';

    type MemberCreatorDoc = Record<string, unknown> & {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      staffRole?: string | null;
    };

    let createdByMemberId: string | undefined;
    let creatorChurchIds: string[] | undefined;
    let sessionMember: MemberCreatorDoc | null = null;

    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const clerkEmail =
        user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
      if (clerkEmail) {
        const member = await db.collection<MemberCreatorDoc>('members').findOne(
          { email: clerkEmail },
          {
            projection: {
              _id: 0,
              id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              staffRole: 1,
              churchIds: 1,
              templeIds: 1,
            },
          }
        );
        if (member?.id) {
          sessionMember = member;
          createdByMemberId = String(member.id).trim();
          const churchIdsNorm = normalizeMemberChurchIds(member);
          if (churchIdsNorm.length > 0) {
            creatorChurchIds = churchIdsNorm;
          }

          if (leaders.length === 0 && isLeadershipStaffRole(member.staffRole)) {
            const displayName =
              `${String(member.firstName ?? '').trim()} ${String(member.lastName ?? '').trim()}`.trim() ||
              'Líder';
            const leaderEmail = String(member.email ?? clerkEmail)
              .trim()
              .toLowerCase();
            leaders = [
              {
                id: createdByMemberId,
                name: displayName,
                email: leaderEmail,
              },
            ];
          }
        }
      }
    }

    let churchIdSaved: string | undefined;
    if (churchIdRaw) {
      if (!sessionMember?.id) {
        return NextResponse.json(
          { error: 'Debe iniciar sesión con un perfil de miembro para vincular un templo.' },
          { status: 400 }
        );
      }
      if (!isLeadershipStaffRole(sessionMember.staffRole)) {
        return NextResponse.json(
          {
            error:
              'Solo personal pastoral o de dirección puede vincular un templo al ministerio.',
          },
          { status: 400 }
        );
      }
      const allowedChurchIds = new Set(normalizeMemberChurchIds(sessionMember));
      if (!allowedChurchIds.has(churchIdRaw)) {
        return NextResponse.json(
          { error: 'Ese templo no está asignado a su perfil.' },
          { status: 400 }
        );
      }
      const church = await db
        .collection<ChurchLocation>(CHURCHES_COLLECTION)
        .findOne({ id: churchIdRaw }, { projection: { _id: 0, id: 1 } });
      if (!church) {
        return NextResponse.json({ error: 'El templo indicado no existe.' }, { status: 400 });
      }
      churchIdSaved = church.id;
    }

    const memberCount = leaders.length;
    const doc: MinistryDocument = {
      id: randomUUID(),
      name: body.name.trim(),
      normalizedName,
      description: body.description.trim(),
      category: body.category,
      leaders,
      memberCount,
      createdAt: new Date().toISOString(),
      ...(createdByMemberId ? { createdByMemberId } : {}),
      ...(creatorChurchIds ? { creatorChurchIds } : {}),
      ...(churchIdSaved ? { churchId: churchIdSaved } : {}),
    };
    try {
      await ministriesCollection.insertOne(doc);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && Number((error as { code?: unknown }).code) === 11000) {
        return NextResponse.json(
          { error: 'Ese grupo o ministerio ya existe. Escriba un nombre diferente.' },
          { status: 409 }
        );
      }
      throw error;
    }
    return NextResponse.json(
      { ok: true, id: doc.id, message: 'Ministerio creado correctamente.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/ministries POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
