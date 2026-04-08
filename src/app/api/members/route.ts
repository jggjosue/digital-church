import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { consumePhotoUpload } from '@/lib/member-photo-upload';
import { mongoOrMemberBelongsToChurch, normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { MINISTRIES_COLLECTION, type MinistryDocument } from '@/lib/ministries';
import { isFullAccessStaffRole, isLeadershipStaffRole } from '@/lib/pastor-church-access';

export const createMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  dob: z.string().min(1),
  spiritualBirthday: z.string().nullable().optional(),
  groups: z.array(z.string()).default([]),
  /** Ids de documentos en la colección `churches` (y opcionalmente `otro`). */
  churchIds: z.array(z.string()).default([]),
  membershipStatus: z.string().min(1),
  photoDataUrl: z.string().nullable().optional(),
  /** Imagen ya guardada vía POST /api/member-photo-uploads al seleccionar archivo. */
  photoUploadId: z.string().uuid().optional(),
  /**
   * Departamento organizacional (opcional). Ausente o vacío → `null` en Mongo.
   * El alta/edición por UI ya no lo envía; puede seguir existiendo en datos antiguos o vía API.
   */
  department: z.string().max(120).optional(),
  staffRole: z.string().max(200).optional(),
  /** Id del documento en la colección `staff_roles`. */
  portalRoleId: z.string().uuid().nullable().optional(),
  staffRoleGrants: z
    .object({
      roleId: z.string().uuid(),
      name: z.string().min(1),
      description: z.string(),
      modules: z.record(z.array(z.string())),
    })
    .nullable()
    .optional(),
});

export type MemberDocument = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  spiritualBirthday: string | null;
  groups: string[];
  /** Referencias a `churches.id` en MongoDB (puede incluir `otro`). */
  churchIds: string[];
  membershipStatus: string;
  photoDataUrl: string | null;
  /** Departamento para directorios filtrados; `null` = sin asignar en el formulario. */
  department: string | null;
  staffRole: string | null;
  portalRoleId?: string | null;
  staffRoleGrants?: {
    roleId: string;
    name: string;
    description: string;
    modules: Record<string, string[]>;
  } | null;
  /** `members.id` del usuario que editó por último (sesión Clerk → email → miembro). */
  updatedByMemberId?: string | null;
};

/** Límite aproximado para evitar superar el tope de 16MB de un documento BSON con foto en base64. */
const MAX_PHOTO_DATA_URL_LENGTH = 12_000_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Ej. `?department=Pastoral` → solo miembros con ese `department` en el documento.
    const department = searchParams.get('department')?.trim();
    const group = searchParams.get('group')?.trim();
    const q = searchParams.get('q')?.trim();
    /** Ej. `?staffRoles=Admin,Pastor` → solo miembros cuyo `staffRole` coincide (sin distinguir mayúsculas). */
    const staffRolesRaw = searchParams.get('staffRoles')?.trim();
    const churchIdParam = searchParams.get('churchId')?.trim();
    /** Varias iglesias (coma-separado), p. ej. edición de ministerio con varios `creatorChurchIds`. */
    const churchIdsRaw = searchParams.get('churchIds')?.trim();
    const churchIdsList = churchIdsRaw
      ? [...new Set(churchIdsRaw.split(',').map((s) => s.trim()).filter(Boolean))]
      : [];
    /** Pantalla «Asignar a ministerio»: oculta pastores (rol exacto) que ya están en algún ministerio. */
    const excludePastorsInMinistry =
      searchParams.get('excludePastorsInMinistry') === '1' ||
      searchParams.get('excludePastorsInMinistry') === 'true';
    /** Si está activo, limita resultados a los templos del miembro en sesión. */
    const sessionChurchScope =
      searchParams.get('sessionChurchScope') === '1' ||
      searchParams.get('sessionChurchScope') === 'true';
    const limitParam = Number(searchParams.get('limit') ?? '0');
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 0;

    const conditions: Record<string, unknown>[] = [];
    const db = await getDb();

    if (sessionChurchScope) {
      const { userId } = await auth();
      const denyAll = () => conditions.push({ id: '__session_church_scope_empty__' });

      if (!userId) {
        denyAll();
      } else {
        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
        if (!email) {
          denyAll();
        } else {
          const sessionMember = await db
            .collection<Record<string, unknown>>('members')
            .findOne(
              { email },
              { projection: { _id: 0, churchIds: 1, templeIds: 1, staffRole: 1 } }
            );
          if (!sessionMember) {
            denyAll();
          } else if (isFullAccessStaffRole(sessionMember.staffRole as string | null | undefined)) {
            // Sin filtro por templos: mismo alcance que admin.
          } else {
            const sessionChurchIds = normalizeMemberChurchIds(sessionMember);
            if (sessionChurchIds.length > 0) {
              conditions.push({
                $or: sessionChurchIds.map((cid) => mongoOrMemberBelongsToChurch(cid)),
              });
            } else {
              denyAll();
            }
          }
        }
      }
    }

    if (churchIdsList.length > 0) {
      conditions.push({
        $or: churchIdsList.map((cid) => mongoOrMemberBelongsToChurch(cid)),
      });
    } else if (churchIdParam) {
      conditions.push(mongoOrMemberBelongsToChurch(churchIdParam));
    }

    if (department) {
      conditions.push({ department });
    }
    if (group) {
      conditions.push({ groups: group });
    }
    if (staffRolesRaw) {
      const roles = staffRolesRaw
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      if (roles.length > 0) {
        const pattern = roles
          .map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('|');
        conditions.push({
          staffRole: { $regex: `^(${pattern})$`, $options: 'i' },
        });
      }
    }
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const byName = new RegExp(escaped, 'i');
      const compact = q.replace(/\s+/g, '');
      const byFullName = compact ? new RegExp(compact, 'i') : byName;
      conditions.push({
        $or: [
          { firstName: byName },
          { lastName: byName },
          { email: byName },
          { phone: byName },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $replaceAll: {
                    input: { $concat: ['$firstName', '$lastName'] },
                    find: ' ',
                    replacement: '',
                  },
                },
                regex: byFullName.source,
                options: 'i',
              },
            },
          },
        ],
      });
    }

    const filter: Record<string, unknown> =
      conditions.length === 0
        ? {}
        : conditions.length === 1
          ? conditions[0]!
          : { $and: conditions };

    let query = db
      .collection<MemberDocument>('members')
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    const docs = await query.toArray();
    let members = docs.map((raw) => {
      const { templeIds: _legacyTemple, ...rest } = raw as Record<string, unknown>;
      return {
        ...rest,
        churchIds: normalizeMemberChurchIds(raw as unknown as Record<string, unknown>),
      } as MemberDocument;
    });

    if (excludePastorsInMinistry && members.length > 0) {
      const ministryDocs = await db
        .collection<Pick<MinistryDocument, 'leaders' | 'memberAssignments'>>(MINISTRIES_COLLECTION)
        .find({}, { projection: { _id: 0, leaders: 1, memberAssignments: 1 } })
        .toArray();
      const memberIdsInAnyMinistry = new Set<string>();
      for (const doc of ministryDocs) {
        for (const leader of doc.leaders ?? []) {
          const id = String(leader.id ?? '').trim();
          if (id) memberIdsInAnyMinistry.add(id);
        }
        for (const a of doc.memberAssignments ?? []) {
          const id = String(a.memberId ?? '').trim();
          if (id) memberIdsInAnyMinistry.add(id);
        }
      }
      members = members.filter(
        (m) =>
          !(
            isLeadershipStaffRole(m.staffRole) &&
            memberIdsInAnyMinistry.has(String(m.id).trim())
          )
      );
    }

    return NextResponse.json({ members });
  } catch (e) {
    console.error('[api/members GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const deleteBodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function DELETE(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = deleteBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Envíe { "ids": ["id1", ...] } con al menos un id.' },
        { status: 400 }
      );
    }
    const db = await getDb();
    const result = await db.collection('members').deleteMany({
      id: { $in: parsed.data.ids },
    });
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount });
  } catch (e) {
    console.error('[api/members DELETE]', e);
    const message =
      e instanceof Error ? e.message : 'Error al eliminar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createMemberSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const db = await getDb();
    let photoDataUrl = await consumePhotoUpload(
      db,
      body.photoUploadId,
      body.photoDataUrl ?? null
    );
    if (photoDataUrl && photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
      photoDataUrl = null;
    }

    // Omisión o cadena vacía → `null` en Mongo (equivalente a «Sin asignar» en el UI).
    const department =
      body.department !== undefined && String(body.department).trim() !== ''
        ? String(body.department).trim()
        : null;
    const staffRole =
      body.staffRole !== undefined && String(body.staffRole).trim() !== ''
        ? String(body.staffRole).trim()
        : null;

    const portalRoleId =
      body.portalRoleId !== undefined && body.portalRoleId !== null
        ? String(body.portalRoleId).trim()
        : body.portalRoleId === null
          ? null
          : undefined;

    const normalizedEmail = body.email.trim().toLowerCase();
    const members = db.collection<MemberDocument>('members');
    const existing = await members.findOne(
      { email: normalizedEmail },
      { projection: { _id: 0, id: 1, createdAt: 1 } }
    );

    const setPayload: Partial<MemberDocument> = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: normalizedEmail,
      phone: body.phone.trim(),
      address: body.address.trim(),
      dob: body.dob,
      spiritualBirthday: body.spiritualBirthday ?? null,
      groups: [...body.groups],
      churchIds: [...body.churchIds],
      membershipStatus: body.membershipStatus,
      photoDataUrl,
      department,
      staffRole,
      ...(portalRoleId !== undefined ? { portalRoleId } : {}),
      ...(body.staffRoleGrants !== undefined ? { staffRoleGrants: body.staffRoleGrants } : {}),
    };

    if (existing?.id) {
      await members.updateOne({ id: existing.id }, { $set: setPayload });
      return NextResponse.json({
        ok: true,
        id: existing.id,
        message: 'Miembro actualizado correctamente según el correo registrado.',
      });
    }

    const doc: MemberDocument = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      firstName: setPayload.firstName ?? '',
      lastName: setPayload.lastName ?? '',
      email: setPayload.email ?? '',
      phone: setPayload.phone ?? '',
      address: setPayload.address ?? '',
      dob: setPayload.dob ?? '',
      spiritualBirthday: setPayload.spiritualBirthday ?? null,
      groups: setPayload.groups ?? [],
      churchIds: setPayload.churchIds ?? [],
      membershipStatus: setPayload.membershipStatus ?? 'active',
      photoDataUrl: setPayload.photoDataUrl ?? null,
      department: setPayload.department ?? null,
      staffRole: setPayload.staffRole ?? null,
      ...(portalRoleId !== undefined ? { portalRoleId } : {}),
      ...(body.staffRoleGrants !== undefined ? { staffRoleGrants: body.staffRoleGrants } : {}),
    };

    await members.insertOne(doc);

    return NextResponse.json({
      ok: true,
      id: doc.id,
      message: 'Miembro guardado correctamente.',
    });
  } catch (e) {
    console.error('[api/members POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
