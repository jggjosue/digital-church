import type { IciarTempleSchedule } from '@/lib/iciar-temples';
import { ICIAR_TEMPLES } from '@/lib/iciar-temples';

/** Colección en MongoDB para templos / ubicaciones (sustituye a `church_locations`). */
export const CHURCHES_COLLECTION = 'churches';

/** @deprecated Usar `CHURCHES_COLLECTION`. */
export const CHURCH_LOCATIONS_COLLECTION = CHURCHES_COLLECTION;

/** Área interna de un templo (salón, almacén, etc.) para asignar ítems de inventario. */
export type ChurchInventoryArea = {
  id: string;
  name: string;
};

export type ChurchLocation = {
  id: string;
  name: string;
  /** Áreas internas opcionales para inventario por templo. */
  inventoryAreas?: ChurchInventoryArea[];
  /** Dirección en una sola línea (compatibilidad UI). */
  address: string;
  municipality: string;
  country: string;
  lat: number;
  lng: number;
  embedUrl: string;
  shareMapUrl: string;
  phone: string;
  schedule: IciarTempleSchedule[];
  createdAt: string;
  streetAddress?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
  campusPastor?: string;
  contactEmail?: string;
  description?: string;
  /** Id del miembro (`members.id`) que creó la ubicación (p. ej. pastor que da de alta el templo). */
  createdByMemberId?: string;
};

/** Texto secundario en listas (prioriza ciudad/estado del documento en BD). */
export function formatChurchLocationLine(
  doc: Pick<
    ChurchLocation,
    'city' | 'state' | 'municipality' | 'address' | 'neighborhood' | 'streetAddress'
  >
): string {
  const city = doc.city?.trim();
  const state = doc.state?.trim();
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  const muni = doc.municipality?.trim();
  if (muni) return muni;
  const street = doc.streetAddress?.trim();
  const nb = doc.neighborhood?.trim();
  if (street && nb) return `${street}, ${nb}`;
  if (street) return street;
  if (nb) return nb;
  const addr = doc.address?.trim();
  if (addr) return addr;
  return '';
}

const COUNTRY_NAME_FOR_MAPS: Record<string, string> = {
  mexico: 'México',
  usa: 'Estados Unidos',
  canada: 'Canadá',
};

export function buildMapsUrlsFromAddress(parts: {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}): { embedUrl: string; shareMapUrl: string } {
  const countryName = COUNTRY_NAME_FOR_MAPS[parts.country] ?? parts.country;
  const q = [parts.address, parts.city, parts.state, parts.zip, countryName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');
  const enc = encodeURIComponent(q);
  return {
    embedUrl: `https://maps.google.com/maps?q=${enc}&z=14&output=embed`,
    shareMapUrl: `https://www.google.com/maps/search/?api=1&query=${enc}`,
  };
}

/** IDs estables alineados 1:1 con `ICIAR_TEMPLES` (https://iciarnayarit.com/templos). */
const DEFAULT_SEED_IDS = [
  'templo-la-nueva-jerusalen',
  'templo-getsemani',
  'templo-el-limon',
  'mision-aguamilpa',
  'mision-el-naranjo',
  'iglesia-cofradia-de-pericos',
  'mision-los-cuervitos',
  'mision-san-miguel-huaixtita',
  'mision-ixtlan-del-rio',
  'mision-puerta-azul',
  'templo-col-el-ahualamo',
  'mision-el-saucito',
  'mision-rancho-viejo',
  'mision-el-pintadeno',
] as const;

/** Campos postales explícitos alineados con la lista oficial ICIAR (todos los templos en `ICIAR_TEMPLES`). */
const STRUCTURED_SEED: Record<
  string,
  { streetAddress: string; neighborhood: string; zip: string; city: string; state: string }
> = {
  'templo-la-nueva-jerusalen': {
    streetAddress: 'Hierro 233',
    neighborhood: 'Valle de Matatipac',
    zip: '63195',
    city: 'Tepic',
    state: 'Nayarit',
  },
  'templo-getsemani': {
    streetAddress: 'Tijuanita',
    neighborhood: 'Valparaíso',
    zip: '63625',
    city: 'Ruiz',
    state: 'Nayarit',
  },
  'templo-el-limon': {
    streetAddress: '',
    neighborhood: '',
    zip: '',
    city: 'El Limón',
    state: 'Nayarit',
  },
  'mision-aguamilpa': {
    streetAddress: '',
    neighborhood: '',
    zip: '63739',
    city: 'Aguamilpa',
    state: 'Nayarit',
  },
  'mision-el-naranjo': {
    streetAddress: '',
    neighborhood: 'Sierra del Nayar',
    zip: '',
    city: 'El Naranjo',
    state: 'Nayarit',
  },
  'iglesia-cofradia-de-pericos': {
    streetAddress: '',
    neighborhood: 'Sierra del Nayar',
    zip: '',
    city: 'Cofradía de Pericos',
    state: 'Nayarit',
  },
  'mision-los-cuervitos': {
    streetAddress: '',
    neighborhood: '',
    zip: '63536',
    city: 'Los Cuervitos',
    state: 'Nayarit',
  },
  'mision-san-miguel-huaixtita': {
    streetAddress: '',
    neighborhood: 'Sierra del Nayar',
    zip: '',
    city: 'San Miguel Huaixtita',
    state: 'Nayarit',
  },
  'mision-ixtlan-del-rio': {
    streetAddress: '',
    neighborhood: '',
    zip: '',
    city: 'Ixtlán del Río',
    state: 'Nayarit',
  },
  'mision-puerta-azul': {
    streetAddress: '',
    neighborhood: '',
    zip: '63552',
    city: 'Puerta Azul',
    state: 'Nayarit',
  },
  'templo-col-el-ahualamo': {
    streetAddress: '',
    neighborhood: 'Col. el Ahualamo',
    zip: '63870',
    city: 'Santa María del Oro',
    state: 'Nayarit',
  },
  'mision-el-saucito': {
    streetAddress: '',
    neighborhood: 'Sierra del Nayar',
    zip: '63535',
    city: 'El Saucito',
    state: 'Nayarit',
  },
  'mision-rancho-viejo': {
    streetAddress: '',
    neighborhood: 'Sierra del Nayar',
    zip: '63535',
    city: 'Rancho Viejo',
    state: 'Nayarit',
  },
  'mision-el-pintadeno': {
    streetAddress: '',
    neighborhood: '',
    zip: '',
    city: 'El Pintadeño',
    state: 'Nayarit',
  },
};

export function buildDefaultChurchDocuments(): ChurchLocation[] {
  if (ICIAR_TEMPLES.length !== DEFAULT_SEED_IDS.length) {
    throw new Error(
      `ICIAR_TEMPLES (${ICIAR_TEMPLES.length}) y DEFAULT_SEED_IDS (${DEFAULT_SEED_IDS.length}) deben tener la misma longitud.`
    );
  }
  const now = new Date().toISOString();
  return ICIAR_TEMPLES.map((t, i) => {
    const id = DEFAULT_SEED_IDS[i];
    const s = STRUCTURED_SEED[id];
    return {
      id,
      name: t.name,
      address: t.address,
      municipality: t.municipality,
      country: 'mexico',
      lat: t.lat,
      lng: t.lng,
      embedUrl: t.embedUrl,
      shareMapUrl: t.shareMapUrl,
      phone: '',
      schedule: t.schedule,
      createdAt: now,
      streetAddress: s.streetAddress,
      neighborhood: s.neighborhood,
      zip: s.zip,
      city: s.city,
      state: s.state,
    };
  });
}

/** Evita filas duplicadas (p. ej. tras migraciones) que rompen keys en React. */
export function dedupeChurchesById(docs: ChurchLocation[]): ChurchLocation[] {
  const seen = new Set<string>();
  const out: ChurchLocation[] = [];
  for (const doc of docs) {
    const id = String(doc.id ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(doc);
  }
  return out;
}

export type ChurchSelectOption = {
  id: string;
  name: string;
  municipality: string;
};

/** Opciones de UI alineadas con el seed por defecto (fallback si falla GET /api/churches). */
export function churchSelectOptionsFromSeed(): ChurchSelectOption[] {
  return buildDefaultChurchDocuments().map((c) => ({
    id: c.id,
    name: c.name,
    municipality: c.municipality,
  }));
}
