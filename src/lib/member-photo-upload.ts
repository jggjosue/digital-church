import type { Db } from 'mongodb';

const COLLECTION = 'member_photo_uploads';

/**
 * Si viene `photoUploadId`, toma la imagen de la colección temporal y borra el registro.
 * Si no, usa `fallbackPhotoDataUrl` (p. ej. foto ya en el documento al editar).
 */
export async function consumePhotoUpload(
  db: Db,
  photoUploadId: string | undefined | null,
  fallbackPhotoDataUrl: string | null | undefined
): Promise<string | null> {
  let photoDataUrl: string | null =
    fallbackPhotoDataUrl !== undefined && fallbackPhotoDataUrl !== null
      ? fallbackPhotoDataUrl
      : null;

  const id = typeof photoUploadId === 'string' ? photoUploadId.trim() : '';
  if (!id) {
    return photoDataUrl;
  }

  const upload = await db.collection<{ photoDataUrl: string }>(COLLECTION).findOne({ id });
  if (upload?.photoDataUrl) {
    photoDataUrl = upload.photoDataUrl;
  }
  await db.collection(COLLECTION).deleteOne({ id });
  return photoDataUrl;
}
