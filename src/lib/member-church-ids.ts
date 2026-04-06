/**
 * Antes los miembros usaban `templeIds` con índices "1"…"n" (ICIAR_TEMPLES) y "otro".
 * Ahora el vínculo oficial es `churchIds` (ids de la colección `churches` en MongoDB).
 */

export const LEGACY_TEMPLE_INDEX_TO_CHURCH_ID: Record<string, string> = {
  '1': 'templo-la-nueva-jerusalen',
  '2': 'templo-getsemani',
  '3': 'templo-el-limon',
  '4': 'mision-aguamilpa',
  '5': 'mision-el-naranjo',
};

/** Convierte ids antiguos ("1", "otro") a ids de `churches`; deja pasar ids ya válidos. */
export function normalizeMemberChurchIds(raw: Record<string, unknown>): string[] {
  const church = raw.churchIds;
  if (Array.isArray(church) && church.length > 0) {
    return church.map(String).filter(Boolean);
  }
  const legacy = raw.templeIds;
  if (!Array.isArray(legacy) || legacy.length === 0) return [];
  const out: string[] = [];
  for (const id of legacy.map(String)) {
    if (id === 'otro') {
      if (!out.includes('otro')) out.push('otro');
      continue;
    }
    const mapped = LEGACY_TEMPLE_INDEX_TO_CHURCH_ID[id];
    if (mapped && !out.includes(mapped)) out.push(mapped);
    else if (!mapped && id && !out.includes(id)) out.push(id);
  }
  return out;
}
