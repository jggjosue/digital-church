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
};
