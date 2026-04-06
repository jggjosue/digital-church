import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { consumePhotoUpload } from '@/lib/member-photo-upload';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';

export const createMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  dob: z.string().min(1),
  spiritualBirthday: z.string().nullable().optional(),
  groups: z.array(z.string()).min(1),
  /** Ids de documentos en la colección `churches` (y opcionalmente `otro`). */
  churchIds: z.array(z.string()).min(1),
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
};

/** Límite aproximado para evitar superar el tope de 16MB de un documento BSON con foto en base64. */
const MAX_PHOTO_DATA_URL_LENGTH = 12_000_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Ej. `?department=Pastoral` → solo miembros con ese `department` en el documento.
    const department = searchParams.get('department')?.trim();
    const filter = department ? { department } : {};

    const db = await getDb();
    const docs = await db
      .collection<MemberDocument>('members')
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    const members = docs.map((raw) => {
      const { templeIds: _legacyTemple, ...rest } = raw as Record<string, unknown>;
      return {
        ...rest,
        churchIds: normalizeMemberChurchIds(raw as unknown as Record<string, unknown>),
      } as MemberDocument;
    });
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

    const doc: MemberDocument = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
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
      department,
      staffRole,
    };

    await db.collection<MemberDocument>('members').insertOne(doc);

    return NextResponse.json(
      { ok: true, id: doc.id, message: 'Miembro guardado correctamente.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/members POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
