import type { Db } from 'mongodb';
import { hasPortalPermission } from '@/lib/portal-permissions';

export const SETTINGS_PERMISSIONS = {
  MANAGE_ROLES: 'Roles y Permisos',
  LIST_ROLES: 'Lista de Roles',
  MANAGE_USERS: 'Usuarios',
} as const;

export const hasSettingsAccess = (db: Db, permission: string) =>
  hasPortalPermission(db, 'Configuración', permission);
