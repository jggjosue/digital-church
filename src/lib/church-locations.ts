import type { IciarTempleSchedule } from '@/lib/iciar-temples';
import { ICIAR_TEMPLES } from '@/lib/iciar-temples';

/** Colección en MongoDB para templos / ubicaciones (sustituye a `church_locations`). */
export const CHURCHES_COLLECTION = 'churches';

export function normalizeChurchName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es');
}

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
  normalizedName?: string;
  /** Alta rápida desde el selector de templos de un perfil; datos administrativos pendientes. */
  profileCreated?: boolean;
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
  /** Fecha ISO (AAAA-MM-DD) desde la que el pastor sirve en este templo. */
  pastoralStartDate?: string;
  /** Matrícula institucional que aparece en el certificado del templo. */
  registrationNumber?: string;
  /** Descripción de la asignación pastoral que aparece en el certificado. */
  pastoralAssignment?: string;
  contactEmail?: string;
  description?: string;
  /** Enlace opcional a carpeta de Google Drive o repositorio digital de documentos del templo (permisos, luz, agua, construcción, etc.). */
  driveFolderUrl?: string;
  /** Id del miembro (`members.id`) que creó la ubicación (p. ej. pastor que da de alta el templo). */
  createdByMemberId?: string;
};

/**
 * Normaliza y canoniza nombres de municipios para evitar duplicados en listas y filtros.
 * Elimina comas/puntuación al final, espacios extras y homologa variantes comunes.
 */
export function normalizeMunicipality(raw?: string | null): string {
  if (!raw) return '';

  let clean = raw
    .trim()
    .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '')
    .replace(/\s+/g, ' ');

  if (!clean) return '';

  const lower = clean
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    lower === 'el nayar' ||
    lower === 'del nayar' ||
    lower === 'sierra del nayar' ||
    lower === 'sierra de nayar'
  ) {
    return 'El Nayar';
  }

  if (
    lower === 'sierra de mezquitic' ||
    lower === 'sierra del mezquital' ||
    lower === 'mezquitic' ||
    lower === 'mezquital'
  ) {
    return 'Mezquital';
  }

  if (lower === 'santa maria del oro') {
    return 'Santa María del Oro';
  }

  if (lower === 'ixtlan del rio') {
    return 'Ixtlán del Río';
  }

  if (lower === 'santiago ixcuintla') {
    return 'Santiago Ixcuintla';
  }

  if (lower === 'san blas') {
    return 'San Blas';
  }

  if (lower === 'tepic') {
    return 'Tepic';
  }

  if (lower === 'ruiz') {
    return 'Ruiz';
  }

  return clean;
}

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
  const muni = normalizeMunicipality(doc.municipality);
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
  'iglesia-cristiana-rios-de-agua-viva-iciar',
  'templo-puerta-del-rey-iciar',
  'llamados-a-crecer-iciar',
  'torre-fuerte-iciar',
  'iciar-maranatha-ixtapaluca',
  'templo-sayula-rios-de-agua-viva-iciar',
  'iglesia-interdenominacional-la-hermosa-zapopan',
  'templo-divino-alfarero-tonala',
  'iglesia-cristiana-torre-fuerte-san-sebastian',
  'iciar-chapala',
  'iciar-pacana',
  'monte-sion-gomez-farias',
] as const;

/** Campos postales explícitos alineados con la lista oficial ICIAR (todos los templos en `ICIAR_TEMPLES`). */
const STRUCTURED_SEED: Record<
  string,
  { streetAddress: string; neighborhood: string; zip: string; city: string; state: string }
> = {
  'iglesia-cristiana-rios-de-agua-viva-iciar': {
    streetAddress: 'Prol. Av. Tepeyac 975',
    neighborhood: 'Paraísos del Colli',
    zip: '45069',
    city: 'Zapopan',
    state: 'Jalisco',
  },
  'templo-puerta-del-rey-iciar': {
    streetAddress: 'Biblia 328',
    neighborhood: 'La Duraznera',
    zip: '45580',
    city: 'San Pedro Tlaquepaque',
    state: 'Jalisco',
  },
  'llamados-a-crecer-iciar': {
    streetAddress: 'C. Río Blanco',
    neighborhood: 'La Venta del Astillero',
    zip: '45221',
    city: 'Zapopan',
    state: 'Jalisco',
  },
  'torre-fuerte-iciar': {
    streetAddress: 'C. María Ciudadano Bancalari 3222 / C. Adolfo Cisneros 1216',
    neighborhood: 'Echeverría',
    zip: '44970',
    city: 'Guadalajara',
    state: 'Jalisco',
  },
  'iciar-maranatha-ixtapaluca': {
    streetAddress: 'Alfonso Reyes 2',
    neighborhood: 'La Venta',
    zip: '56530',
    city: 'Ixtapaluca',
    state: 'Estado de México',
  },
  'templo-sayula-rios-de-agua-viva-iciar': {
    streetAddress: 'C. Benito Juárez 267',
    neighborhood: 'Aguacatera',
    zip: '49314',
    city: 'Sayula',
    state: 'Jalisco',
  },
  'iglesia-interdenominacional-la-hermosa-zapopan': {
    streetAddress: 'Fray Toribio de Motolinía 1363',
    neighborhood: 'San Francisco',
    zip: '45140',
    city: 'Zapopan',
    state: 'Jalisco',
  },
  'templo-divino-alfarero-tonala': {
    streetAddress: 'Galeana 151',
    neighborhood: 'Centro',
    zip: '45400',
    city: 'Tonalá',
    state: 'Jalisco',
  },
  'iglesia-cristiana-torre-fuerte-san-sebastian': {
    streetAddress: 'Del Valle 15',
    neighborhood: 'Santa Cecilia',
    zip: '49120',
    city: 'San Sebastián del Sur',
    state: 'Jalisco',
  },
  'iciar-chapala': {
    streetAddress: 'Emiliano Zapata 47',
    neighborhood: 'Centro',
    zip: '45900',
    city: 'Chapala',
    state: 'Jalisco',
  },
  'iciar-pacana': {
    streetAddress: '',
    neighborhood: 'Castro Urdiales (Pacana)',
    zip: '45325',
    city: 'Pacana',
    state: 'Jalisco',
  },
  'monte-sion-gomez-farias': {
    streetAddress: 'C. Cedro Blanco 100',
    neighborhood: 'Fraccionamiento San Pedro, Col. Iprovipe',
    zip: '49120',
    city: 'San Sebastián del Sur',
    state: 'Jalisco',
  },
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
