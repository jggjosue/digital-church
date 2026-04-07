import type { ChurchInventoryArea } from '@/lib/church-locations';

export type ResourceStatus = 'available' | 'in_use' | 'maintenance';
export type ConditionKey = 'excellent' | 'good' | 'repair';

/** Documento en la colección `inventory` que agrupa áreas por templo. */
export const INVENTORY_DOC_TYPE_CHURCH_AREAS = 'church_inventory_areas' as const;

export type ChurchInventoryAreasDoc = {
  docType: typeof INVENTORY_DOC_TYPE_CHURCH_AREAS;
  id: string;
  churchId: string;
  churchName: string;
  areas: ChurchInventoryArea[];
  updatedAt: string;
};

export function churchInventoryAreasDocumentId(churchId: string): string {
  return `church-areas-${churchId}`;
}

export type ResourceRow = {
  id: string;
  name: string;
  category: string;
  categoryFilter: string;
  location: string;
  locationFilter: string;
  locationTone: 'blue' | 'purple' | 'muted' | 'orange';
  locationPill?: boolean;
  quantity: number;
  condition: ConditionKey;
  status: ResourceStatus;
  /** Presente cuando la ubicación viene de un templo (`inventoryAreas`). */
  churchId?: string;
  areaId?: string;
};

export type InventoryDoc = ResourceRow;

export type CategoryOption = {
  id: number;
  value: string;
  label: string;
};

/** `categoryFilter` por defecto cuando el formulario de alta no incluye categoría. */
export const INVENTORY_DEFAULT_CATEGORY_VALUE = '_uncategorized';
export const INVENTORY_DEFAULT_CATEGORY_LABEL = 'Sin categoría';

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 1, value: 'furniture', label: 'Mobiliario y asientos' },
  { id: 2, value: 'av', label: 'Equipo audiovisual' },
  { id: 3, value: 'janitorial', label: 'Limpieza' },
  { id: 4, value: 'education', label: 'Educación' },
  { id: 5, value: 'maintenance-infrastructure', label: 'Mantenimiento de infraestructura' },
  { id: 6, value: 'musical-instruments', label: 'Instrumentos musicales' },
  { id: 7, value: 'office-supplies', label: 'Suministros de oficina' },
  { id: 8, value: 'security-emergency', label: 'Seguridad y emergencias' },
  { id: 9, value: 'events-ceremonies', label: 'Eventos y ceremonias' },
  { id: 10, value: 'kitchen-cafeteria', label: 'Cocina y cafetería' },
  { id: 11, value: 'lighting-electrical', label: 'Iluminación y electricidad' },
  { id: 12, value: 'gardening-outdoor', label: 'Jardinería y áreas externas' },
  { id: 13, value: 'volunteer-management', label: 'Gestión de voluntarios' },
  { id: 14, value: 'library-archives', label: 'Biblioteca y archivos' },
  { id: 15, value: 'technology-it', label: 'Tecnología y redes (IT)' },
];

export const LOCATION_OPTIONS = [
  { value: 'youth', label: 'Salón juvenil', tone: 'blue' as const, pill: false },
  { value: 'sanctuary', label: 'Santuario adultos', tone: 'purple' as const, pill: false },
  { value: 'storage', label: 'Almacén B', tone: 'muted' as const, pill: false },
  { value: 'children', label: 'Ministerio infantil', tone: 'orange' as const, pill: true },
] as const;

export const CONDITION_META: Record<ConditionKey, { label: string; dot: string }> = {
  excellent: { label: 'Excelente', dot: 'bg-emerald-500' },
  good: { label: 'Bueno', dot: 'bg-amber-500' },
  repair: { label: 'Requiere reparación', dot: 'bg-red-500' },
};

export const STATUS_BADGE: Record<
  ResourceStatus,
  { label: string; className: string }
> = {
  available: {
    label: 'Disponible',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50',
  },
  in_use: {
    label: 'En uso',
    className: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50',
  },
  maintenance: {
    label: 'Mantenimiento',
    className: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50',
  },
};

export const LOCATION_LINK_CLASS: Record<ResourceRow['locationTone'], string> = {
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  muted: 'text-muted-foreground',
  orange: 'text-orange-700',
};

export const MOCK_RESOURCES: ResourceRow[] = [
  {
    id: '1',
    name: 'Sillas plegables negras',
    category: 'Mobiliario y asientos',
    categoryFilter: 'furniture',
    location: 'Salón juvenil',
    locationFilter: 'youth',
    locationTone: 'blue',
    quantity: 120,
    condition: 'excellent',
    status: 'available',
  },
  {
    id: '2',
    name: 'Micrófono inalámbrico Shure SLX',
    category: 'Equipo audiovisual',
    categoryFilter: 'av',
    location: 'Santuario adultos',
    locationFilter: 'sanctuary',
    locationTone: 'purple',
    quantity: 4,
    condition: 'good',
    status: 'in_use',
  },
  {
    id: '3',
    name: 'Pulidora de pisos',
    category: 'Limpieza',
    categoryFilter: 'janitorial',
    location: 'Almacén B',
    locationFilter: 'storage',
    locationTone: 'muted',
    quantity: 1,
    condition: 'repair',
    status: 'maintenance',
  },
  {
    id: '4',
    name: 'Mesas de actividades (grandes)',
    category: 'Educación',
    categoryFilter: 'education',
    location: 'Ministerio infantil',
    locationFilter: 'children',
    locationTone: 'orange',
    locationPill: true,
    quantity: 12,
    condition: 'excellent',
    status: 'available',
  },
];

export function newInventoryId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildResourceRow(input: {
  name: string;
  categoryFilter: string;
  locationFilter: string;
  quantity: number;
  condition: ConditionKey;
  status: ResourceStatus;
}): ResourceRow {
  const cat = CATEGORY_OPTIONS.find((c) => c.value === input.categoryFilter);
  const loc = LOCATION_OPTIONS.find((l) => l.value === input.locationFilter);
  return {
    id: newInventoryId(),
    name: input.name.trim(),
    category: cat?.label ?? input.categoryFilter,
    categoryFilter: input.categoryFilter,
    location: loc?.label ?? input.locationFilter,
    locationFilter: input.locationFilter,
    locationTone: loc?.tone ?? 'muted',
    locationPill: loc?.pill ?? false,
    quantity: input.quantity,
    condition: input.condition,
    status: input.status,
  };
}

/** Ubicación definida por áreas del templo (colección `inventory`, doc `church_inventory_areas`). */
export function buildResourceRowFromTempleArea(input: {
  name: string;
  categoryFilter: string;
  /** Si la categoría es personalizada, pasar la etiqueta aquí. */
  categoryDisplayLabel?: string;
  churchId: string;
  areaId: string;
  areaName: string;
  quantity: number;
  condition: ConditionKey;
  status: ResourceStatus;
}): ResourceRow {
  const cat = CATEGORY_OPTIONS.find((c) => c.value === input.categoryFilter);
  const categoryLabel =
    input.categoryDisplayLabel ?? cat?.label ?? input.categoryFilter;
  const locationFilter = `temple-area:${input.churchId}:${input.areaId}`;
  return {
    id: newInventoryId(),
    name: input.name.trim(),
    category: categoryLabel,
    categoryFilter: input.categoryFilter,
    location: input.areaName.trim(),
    locationFilter,
    locationTone: 'muted',
    locationPill: false,
    quantity: input.quantity,
    condition: input.condition,
    status: input.status,
    churchId: input.churchId,
    areaId: input.areaId,
  };
}
