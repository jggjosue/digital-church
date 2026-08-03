import { auth, currentUser } from '@clerk/nextjs/server';
import type { Db } from 'mongodb';
import { isFullAccessStaffRole, isLeadershipStaffRole } from '@/lib/pastor-church-access';
import type { StaffRoleDocument } from '@/lib/staff-roles';

export { OFFERING_PERMISSIONS } from '@/lib/permission-constants';

type MemberPermissionDoc = {
  staffRole?: string | null;
  portalRoleId?: string | null;
  staffRoleGrants?: { modules?: Record<string, string[]> } | null;
};

const normalize = (value: string) => value.trim().toLowerCase();

export async function resolvePortalModules(db: Db): Promise<Record<string, string[]> | null> {
  const { userId } = await auth();
  if (!userId) return {};
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (!email) return {};
  const member = await db.collection<MemberPermissionDoc>('members').findOne({ email }, { projection: { _id: 0, staffRole: 1, portalRoleId: 1, staffRoleGrants: 1 } });
  if (!member) return {};
  if (isFullAccessStaffRole(member.staffRole) || isLeadershipStaffRole(member.staffRole)) return null;
  if (normalize(String(member.staffRole ?? '')) === 'congregante') return { Ofrendas: ['Añadir Donación'] };
  if (member.staffRoleGrants?.modules) return member.staffRoleGrants.modules;
  const roleId = String(member.portalRoleId ?? '').trim();
  const role = roleId ? await db.collection<StaffRoleDocument>('staff_roles').findOne({ id: roleId }, { projection: { modules: 1 } }) : null;
  return role?.modules ?? {};
}

export async function hasPortalPermission(db: Db, moduleName: string, permission: string) {
  const modules = await resolvePortalModules(db);
  if (modules === null) return true;
  const moduleKey = Object.keys(modules).find((key) => normalize(key) === normalize(moduleName));
  const allowed = moduleKey ? modules[moduleKey] : [];
  return allowed.some((value) => normalize(value) === '*' || normalize(value) === normalize(permission));
}
