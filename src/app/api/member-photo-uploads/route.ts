import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';

const MAX_PHOTO_DATA_URL_LENGTH = 12_000_000;

const postBodySchema = z.object({
  photoDataUrl: z.string().min(1),
});

export type MemberPhotoUploadDoc = {
  id: string;
  photoDataUrl: string;
  createdAt: string;
};

/** POST: guarda la imagen en MongoDB al seleccionarla (antes de crear el miembro). */
export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = postBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Envíe { "photoDataUrl": "data:image/..." }.' },
        { status: 400 }
      );
    }
    let { photoDataUrl } = parsed.data;
    if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
      return NextResponse.json(
        { error: 'La imagen es demasiado grande. Use una foto más pequeña.' },
        { status: 400 }
      );
    }

    const doc: MemberPhotoUploadDoc = {
      id: randomUUID(),
      photoDataUrl,
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.collection<MemberPhotoUploadDoc>('member_photo_uploads').insertOne(doc);

    return NextResponse.json({
      ok: true,
      photoUploadId: doc.id,
      message: 'Imagen guardada en la base de datos.',
    });
  } catch (e) {
    console.error('[api/member-photo-uploads POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar la imagen en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE: elimina una subida temporal (p. ej. al elegir otra foto). */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'Falta el parámetro id.' }, { status: 400 });
    }
    const db = await getDb();
    await db.collection('member_photo_uploads').deleteOne({ id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/member-photo-uploads DELETE]', e);
    const message =
      e instanceof Error ? e.message : 'Error al eliminar el registro de la imagen.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
