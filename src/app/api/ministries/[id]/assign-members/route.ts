import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { isLeadershipStaffRole } from '@/lib/pastor-church-access';
import { exactPastorCanAccessMinistry } from '@/lib/pastor-ministry-access';
import { CHURCHES_COLLECTION, type ChurchLocation } from '@/lib/church-locations';
import {
  MINISTRIES_COLLECTION,
  type MinistryDocument,
  type MinistryMemberAssignment,
} from '@/lib/ministries';

/** Varios ids en un solo POST; pastores con acceso al ministerio pueden asignar a muchos a la vez. */
const bodySchema = z.object({
  churchId: z.string().min(1).max(200),
  memberIds: z.array(z.string().min(1)).min(1).max(100),
});

type MemberAssignDoc = Record<string, unknown> & {
  id?: string;
  clerkUserId?: string | null;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ministryId } = await context.params;
    const trimmedMinistryId = ministryId?.trim() ?? '';
    if (!trimmedMinistryId) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { churchId: churchIdRaw, memberIds: rawMemberIds } = parsed.data;
    const churchId = churchIdRaw.trim();
    const memberIds = [...new Set(rawMemberIds.map((x) => x.trim()).filter(Boolean))];
    if (memberIds.length === 0) {
      return NextResponse.json({ error: 'Indique al menos un id de miembro válido.' }, { status: 400 });
    }

    const db = await getDb();

    const church = await db
      .collection<ChurchLocation>(CHURCHES_COLLECTION)
      .findOne({ id: churchId }, { projection: { _id: 0, id: 1 } });
    if (!church) {
      return NextResponse.json({ error: 'Templo no encontrado.' }, { status: 400 });
    }

    const ministry = await db
      .collection<MinistryDocument>(MINISTRIES_COLLECTION)
      .findOne({ id: trimmedMinistryId }, { projection: { _id: 0 } });
    if (!ministry) {
      return NextResponse.json({ error: 'Ministerio no encontrado.' }, { status: 404 });
    }

    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
      if (email) {
        const sessionMember = await db
          .collection<{ id?: string; staffRole?: string | null }>('members')
          .findOne({ email }, { projection: { _id: 0, id: 1, staffRole: 1 } });
        if (sessionMember && isLeadershipStaffRole(sessionMember.staffRole)) {
          const mid = String(sessionMember.id ?? '').trim();
          if (!exactPastorCanAccessMinistry(ministry, mid, email)) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
          }
        }
      }
    }

    const now = new Date().toISOString();
    const existing: MinistryMemberAssignment[] = Array.isArray(ministry.memberAssignments)
      ? [...ministry.memberAssignments]
      : [];
    const existingKeys = new Set(existing.map((e) => `${e.memberId}|${e.churchId}`));

    const newEntries: MinistryMemberAssignment[] = [];

    for (const rawMid of memberIds) {
      const mid = rawMid.trim();
      if (!mid) continue;

      const member = await db.collection<MemberAssignDoc>('members').findOne(
        { id: mid },
        { projection: { _id: 0, id: 1, clerkUserId: 1, churchIds: 1, templeIds: 1 } }
      );
      if (!member?.id) {
        return NextResponse.json({ error: `Miembro no encontrado: ${mid}` }, { status: 400 });
      }

      const linked = normalizeMemberChurchIds(member);
      if (!linked.includes(churchId)) {
        return NextResponse.json(
          { error: 'Uno o más miembros no pertenecen al templo indicado.' },
          { status: 400 }
        );
      }

      const key = `${mid}|${churchId}`;
      if (existingKeys.has(key)) {
        continue;
      }
      existingKeys.add(key);

      const clerkRaw = member.clerkUserId;
      const clerkUserId =
        clerkRaw !== undefined && clerkRaw !== null
          ? String(clerkRaw).trim() || null
          : null;

      newEntries.push({
        memberId: mid,
        churchId,
        clerkUserId,
        assignedAt: now,
      });
    }

    if (newEntries.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No hay asignaciones nuevas (ya estaban registradas).',
        added: 0,
      });
    }

    const merged = [...existing, ...newEntries];
    const distinctMemberIds = new Set(
      (ministry.leaders ?? []).map((l) => String(l.id).trim()).filter(Boolean)
    );
    for (const a of merged) {
      distinctMemberIds.add(a.memberId);
    }

    await db.collection<MinistryDocument>(MINISTRIES_COLLECTION).updateOne(
      { id: trimmedMinistryId },
      {
        $set: {
          memberAssignments: merged,
          memberCount: distinctMemberIds.size,
        },
      }
    );

    const ministryName = ministry.name.trim();
    const idsForGroups = newEntries.map((e) => e.memberId);
    if (ministryName && idsForGroups.length > 0) {
      await db.collection('members').updateMany(
        { id: { $in: idsForGroups } },
        { $addToSet: { groups: ministryName } }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `${newEntries.length} miembro(s) asignado(s) al ministerio.`,
      added: newEntries.length,
    });
  } catch (e) {
    console.error('[api/ministries/[id]/assign-members POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
