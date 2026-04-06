import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { consumePhotoUpload } from '@/lib/member-photo-upload';
import { createMemberSchema, type MemberDocument } from '../route';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';

const MAX_PHOTO_DATA_URL_LENGTH = 12_000_000;

function normalizeDoc(raw: Record<string, unknown> | null): MemberDocument | null {
  if (!raw || typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: typeof raw.lastName === 'string' ? raw.lastName : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    address: typeof raw.address === 'string' ? raw.address : '',
    dob:
      raw.dob instanceof Date
        ? raw.dob.toISOString()
        : typeof raw.dob === 'string'
          ? raw.dob
          : new Date(0).toISOString(),
    spiritualBirthday:
      raw.spiritualBirthday === null || raw.spiritualBirthday === undefined
        ? null
        : raw.spiritualBirthday instanceof Date
          ? raw.spiritualBirthday.toISOString()
          : typeof raw.spiritualBirthday === 'string'
            ? raw.spiritualBirthday
            : null,
    groups: Array.isArray(raw.groups) ? raw.groups.map(String) : [],
    churchIds: normalizeMemberChurchIds(raw),
    membershipStatus:
      typeof raw.membershipStatus === 'string' ? raw.membershipStatus : 'active',
    photoDataUrl:
      raw.photoDataUrl === null || raw.photoDataUrl === undefined
        ? null
        : typeof raw.photoDataUrl === 'string'
          ? raw.photoDataUrl
          : null,
    // Campo opcional; puede quedar en BD aunque el formulario ya no lo edite.
    department:
      raw.department === null || raw.department === undefined
        ? null
        : String(raw.department).trim() || null,
    staffRole:
      raw.staffRole === null || raw.staffRole === undefined
        ? null
        : String(raw.staffRole).trim() || null,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const raw = await db
      .collection('members')
      .findOne({ id: id.trim() }, { projection: { _id: 0 } });

    const doc = normalizeDoc(raw as Record<string, unknown> | null);
    if (!doc) {
      return NextResponse.json({ error: 'Miembro no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ member: doc });
  } catch (e) {
    console.error('[api/members/[id] GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }

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

    const staffRole =
      body.staffRole !== undefined && String(body.staffRole).trim() !== ''
        ? String(body.staffRole).trim()
        : null;
    /** Solo actualiza departamento si el cliente lo envía (p. ej. integraciones); si se omite, no se borra el valor en Mongo. */
    const setPayload: Record<string, unknown> = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      dob: body.dob,
      spiritualBirthday: body.spiritualBirthday ?? null,
      groups: [...body.groups],
      churchIds: [...body.churchIds],
      membershipStatus: body.membershipStatus,
      photoDataUrl,
      staffRole,
    };
    if (Object.prototype.hasOwnProperty.call(body, 'department')) {
      setPayload.department =
        body.department !== undefined && String(body.department).trim() !== ''
          ? String(body.department).trim()
          : null;
    }
    const result = await db.collection('members').updateOne(
      { id: id.trim() },
      { $set: setPayload }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Miembro no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Cambios guardados correctamente.' });
  } catch (e) {
    console.error('[api/members/[id] PATCH]', e);
    const message =
      e instanceof Error ? e.message : 'Error al actualizar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
