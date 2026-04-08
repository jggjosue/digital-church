import type { Db } from 'mongodb';

/** Nombre de la colección en MongoDB donde se persisten los ministerios. */
export const MINISTRIES_COLLECTION = 'ministries';

/** Crea la colección `ministries` si aún no existe (idempotente). */
export async function ensureMinistriesCollection(db: Db): Promise<void> {
  const existing = await db
    .listCollections({ name: MINISTRIES_COLLECTION }, { nameOnly: true })
    .toArray();
  if (existing.length === 0) {
    await db.createCollection(MINISTRIES_COLLECTION);
  }
}

export type MinistryLeader = {
  id: string;
  name: string;
  email: string;
};

/** Registro de asignación de un miembro a un ministerio desde un templo concreto. */
export type MinistryMemberAssignment = {
  /** `members.id` */
  memberId: string;
  /** `churches.id` */
  churchId: string;
  /** Id de usuario en Clerk si existe en el documento del miembro. */
  clerkUserId?: string | null;
  assignedAt: string;
};

export type MinistryDocument = {
  id: string;
  name: string;
  description: string;
  category: string;
  leaders: MinistryLeader[];
  /** Total de personas asociadas (por ahora coincide con líderes al crear). */
  memberCount: number;
  createdAt: string;
  /** `members.id` del usuario que creó el registro (relación pastor / ministerio). */
  createdByMemberId?: string;
  /**
   * Copia de `members.churchIds` (y legado `templeIds`) del creador al guardar,
   * para enlazar ministerio con los templos de la iglesia en ese momento.
   */
  creatorChurchIds?: string[];
  /** Templo principal (`churches.id`) elegido al crear; debe ser uno creado por el pastor. */
  churchId?: string;
  /** Asignaciones de miembros (por templo) registradas desde «Asignar miembros». */
  memberAssignments?: MinistryMemberAssignment[];
};

/** Valores permitidos en API y formularios de edición. */
export const MINISTRY_CATEGORY_VALUES = [
  'outreach',
  'worship',
  'youth',
  'children',
  'care',
  'general',
] as const;

export const MINISTRY_CATEGORY_LABELS: Record<string, string> = {
  outreach: 'Alcance Comunitario',
  worship: 'Adoración',
  youth: 'Jóvenes',
  children: 'Niños',
  care: 'Cuidado',
  general: 'Sin categoría',
};

export function ministryCategoryLabel(code: string): string {
  return MINISTRY_CATEGORY_LABELS[code] ?? code;
}

/** Líderes guardados en MongoDB para un ministerio concreto (por `id` del documento). */
export function leadersRegisteredForMinistry(
  ministries: MinistryDocument[],
  ministryId: string
): MinistryLeader[] {
  const m = ministries.find((x) => x.id === ministryId.trim());
  return m?.leaders ?? [];
}
