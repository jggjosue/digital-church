export const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  'jggjosue@gmail.com'
)
  .trim()
  .toLowerCase();

/**
 * Returns true if the provided email matches the configured Super Admin email.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

/**
 * Base staff roles available for regular users.
 */
export const BASE_STAFF_ROLE_OPTIONS = [
  { value: '__none__', label: 'Sin especificar' },
  { value: 'Pastor', label: 'Pastor' },
  { value: 'Congregante', label: 'Congregante' },
  { value: 'Invitado', label: 'Invitado' },
  { value: 'Visitante', label: 'Visitante' },
  { value: 'Asistente', label: 'Asistente' },
  { value: 'Principiante en la fe', label: 'Principiante en la fe' },
  { value: 'Oyente', label: 'Oyente' },
  { value: 'Directiva', label: 'Directiva' },
  { value: 'Presidente', label: 'Presidente' },
  { value: 'Responsable de una Comisión', label: 'Responsable de una Comisión' },
  { value: 'Consejo de pastores', label: 'Consejo de Pastores' },
  { value: 'Director de Instituto', label: 'Director de Instituto' },
  { value: 'Pastor Regional', label: 'Pastor Regional' },
  { value: 'Pastor de Zona', label: 'Pastor de Zona' },
  { value: 'Pastor Presbiterial', label: 'Pastor Presbiterial' },
  { value: 'Ayuda Pastoral', label: 'Ayuda Pastoral' },
  { value: 'Director General', label: 'Director General' },
  { value: 'Estudiante del Instituto', label: 'Estudiante del Instituto' },
  { value: 'Responsable de una Secretaría', label: 'Responsable de una Secretaría' },
] as const;

export const SUPER_ADMIN_ROLE_OPTION = {
  value: 'Super Administrador',
  label: 'Super Administrador',
} as const;

/**
 * Returns the list of staff role options.
 * The "Super Administrador" role is ONLY included if targetEmail belongs to the Super Admin.
 */
export function getStaffRoleOptions(targetEmail?: string | null) {
  if (isSuperAdminEmail(targetEmail)) {
    return [SUPER_ADMIN_ROLE_OPTION, ...BASE_STAFF_ROLE_OPTIONS];
  }
  return BASE_STAFF_ROLE_OPTIONS;
}
