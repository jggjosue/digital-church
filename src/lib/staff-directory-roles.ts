/**
 * Cargos que aparecen en `/members/staff`.
 * Valores alineados con `staffRole` en Mongo y con el formulario de miembros.
 */
export const STAFF_DIRECTORY_ROLES = [
  'Pastor',
  'Directiva',
  'Presidente',
  'Responsable de una Comisión',
  'Consejo de pastores',
  'Director de Instituto',
  'Pastor Regional',
  'Pastor de Zona',
  'Pastor Presbiterial',
  'Director General',
  'Estudiante del Instituto',
] as const;

/** Valor del query `staffRoles` en GET /api/members (coma-separado). */
export const STAFF_DIRECTORY_ROLES_QUERY = STAFF_DIRECTORY_ROLES.join(',');
