/**
 * Categorías de inventario definidas por el usuario (colección `inventory_categories`).
 */

export const INVENTORY_CATEGORIES_COLLECTION = 'inventory_categories';

export type InventoryCustomCategoryDoc = {
  id: string;
  /** Slug único para filtros y API (p. ej. equipo-deportivo). */
  value: string;
  /** Nombre mostrado. */
  label: string;
  /** Id numérico para UI (clave estable en listas). */
  optionId: number;
  createdAt: string;
};

export function slugifyCategoryLabel(label: string): string {
  const base = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'categoria';
}
