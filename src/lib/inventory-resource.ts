/** Colección MongoDB: categorías base de inventario (sincronizadas desde la app). */
export const INVENTORY_RESOURCE_COLLECTION = 'resource';

export const RESOURCE_DOC_KIND_SYSTEM_CATEGORY = 'system_category' as const;

export type ResourceSystemCategoryDoc = {
  kind: typeof RESOURCE_DOC_KIND_SYSTEM_CATEGORY;
  id: number;
  value: string;
  label: string;
  updatedAt: string;
};
