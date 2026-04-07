import { z } from 'zod';
import { PORTAL_PERMISSIONS_BY_MODULE } from '@/lib/portal-nav-data';

const moduleKeys = Object.keys(PORTAL_PERMISSIONS_BY_MODULE);

export const staffRoleModulesSchema = z
  .record(z.string(), z.array(z.string()))
  .superRefine((mods, ctx) => {
    for (const key of Object.keys(mods)) {
      if (!moduleKeys.includes(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Módulo desconocido: ${key}`,
        });
        return;
      }
      const allowed = PORTAL_PERMISSIONS_BY_MODULE[key];
      if (!allowed) return;
      for (const perm of mods[key] ?? []) {
        if (!allowed.includes(perm)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Permiso inválido «${perm}» en ${key}`,
          });
          return;
        }
      }
    }
  });

export const createStaffRoleBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().default(''),
  modules: staffRoleModulesSchema,
  /**
   * Si es true, actualiza el documento del miembro cuyo correo coincide con la sesión Clerk:
   * `portalRoleId`, `staffRole` (nombre del rol) y `staffRoleGrants` (copia de permisos).
   */
  assignToCurrentUser: z.boolean().optional().default(false),
  /** Si se indica, aplica el rol al miembro con este `id` en la colección `members`. */
  assignToMemberId: z.string().uuid().optional(),
});

export type StaffRoleDocument = {
  id: string;
  name: string;
  description: string;
  /** Clave = nombre del módulo (p. ej. Iglesias); valor = etiquetas de subítems permitidos. */
  modules: Record<string, string[]>;
  createdAt: string;
};
