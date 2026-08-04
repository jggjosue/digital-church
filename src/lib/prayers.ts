import { z } from 'zod';
import type { Db } from 'mongodb';

export const PRAYERS_COLLECTION = 'prayers';

export const PRAYER_STATUS_VALUES = ['Activo', 'Respondido'] as const;
export const PRAYER_PRIVACY_VALUES = ['Público', 'Solo Personal', 'Grupo Específico'] as const;

export type PrayerStatus = typeof PRAYER_STATUS_VALUES[number];
export type PrayerPrivacy = typeof PRAYER_PRIVACY_VALUES[number];

export const createPrayerSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es muy largo'),
  description: z.string().min(1, 'La descripción es requerida').max(2000, 'La descripción es muy larga'),
  privacy: z.enum(PRAYER_PRIVACY_VALUES).default('Público'),
  isAnonymous: z.boolean().default(false),
});

export type CreatePrayerInput = z.infer<typeof createPrayerSchema>;

export type PrayerDocument = {
  id: string; // UUID
  title: string;
  description: string;
  memberId?: string;
  submittedBy: string; // Nombre del usuario, o "Anónimo"
  submittedByAvatar?: string;
  submittedByEmail?: string; // Para mantener rastro interno
  status: PrayerStatus;
  privacy: PrayerPrivacy;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function ensurePrayersCollection(db: Db) {
  const collections = await db.listCollections({ name: PRAYERS_COLLECTION }).toArray();
  if (collections.length === 0) {
    await db.createCollection(PRAYERS_COLLECTION);
    await db.collection(PRAYERS_COLLECTION).createIndex({ id: 1 }, { unique: true });
    await db.collection(PRAYERS_COLLECTION).createIndex({ createdAt: -1 });
    await db.collection(PRAYERS_COLLECTION).createIndex({ status: 1 });
  }
}
