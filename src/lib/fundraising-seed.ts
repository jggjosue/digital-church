/**
 * Tipos para documentos de la colección `fundraising` (base digital-church).
 * El campo `id` es la clave estable para rutas y API; suele coincidir con `slug`.
 */

export type FundraisingStatus = 'Active' | 'Completed' | 'Upcoming' | 'Draft';

export type FundraisingCampaignDoc = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: FundraisingStatus;
  raised: number;
  goal: number | null;
  progress: number;
  date: string;
  sortOrder: number;
  /** `churches.id` del templo al crear la campaña. */
  churchId?: string;
  /** `members.id` del usuario en sesión (si hay miembro con el email de Clerk). */
  createdByMemberId?: string | null;
  /** Id de usuario en Clerk al crear la campaña. */
  createdByClerkUserId?: string | null;
};
