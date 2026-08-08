export const CONGREGANTE_ACCESS_ROLES = [
  'congregante',
  'invitado',
  'visitante',
  'asistente',
  'principiante en la fe',
  'oyente',
] as const;

export function isCongreganteAccessRole(role: unknown): boolean {
  const normalized = String(role ?? '').trim().toLocaleLowerCase('es');
  return (CONGREGANTE_ACCESS_ROLES as readonly string[]).includes(normalized);
}

export const CONGREGANTE_ACCESS_ROLE_REGEX =
  '^(congregante|invitado|visitante|asistente|principiante en la fe|oyente)$';

export const BASIC_MEMBER_GROUP_OPTIONS = ['Ninguno', 'Catecúmeno', 'Discipulado'] as const;
