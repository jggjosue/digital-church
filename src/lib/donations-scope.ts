import { auth, currentUser } from '@clerk/nextjs/server';
import type { Db } from 'mongodb';
import { normalizeMemberChurchIds } from '@/lib/member-church-ids';
import { isFullAccessStaffRole } from '@/lib/pastor-church-access';
import { isCongreganteAccessRole } from '@/lib/congregante-access';

type MemberScopeDoc = Record<string, unknown> & {
  id?: string;
  email?: string;
  staffRole?: string | null;
};

export type DonationsScope =
  | { kind: 'open' }
  | { kind: 'none' }
  | { kind: 'scoped'; filter: Record<string, unknown> };

export function buildDonationsReadScope(member: MemberScopeDoc | null, authenticated: boolean, fallbackEmail = ''): DonationsScope {
  if (!authenticated) return { kind: 'open' };
  if (!member) return { kind: 'none' };
  if (isFullAccessStaffRole(member.staffRole)) return { kind: 'open' };
  const churchIds = normalizeMemberChurchIds(member);
  const clauses: Record<string, unknown>[] = [churchIds.length > 0 ? { churchId: { $in: churchIds } } : { churchId: '__no_church_access__' }];
  if (isCongreganteAccessRole(member.staffRole)) {
    const donorId = String(member.id ?? '').trim();
    const donorEmail = String(member.email ?? fallbackEmail).trim().toLowerCase();
    const donorOr: Record<string, unknown>[] = [...(donorId ? [{ 'donor.memberId': donorId }] : []), ...(donorEmail ? [{ 'donor.email': donorEmail }] : [])];
    if (donorOr.length > 0) clauses.push({ $or: donorOr });
  }
  return clauses.length === 1 ? { kind: 'scoped', filter: clauses[0]! } : { kind: 'scoped', filter: { $and: clauses } };
}

/**
 * Alcance de lectura para la colección `donation`: admins sin límite; congregantes por templo + donante;
 * pastores y demás roles de staff por templos en `members.churchIds` / `templeIds`.
 * Sesión sin miembro enlazado por email → sin acceso (misma idea que `/api/fundraising`).
 */
export async function resolveDonationsReadScope(db: Db): Promise<DonationsScope> {
  const { userId } = await auth();
  if (!userId) return buildDonationsReadScope(null, false);

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
  if (!email) return { kind: 'none' };

  const member = await db.collection<MemberScopeDoc>('members').findOne(
    { email },
    { projection: { _id: 0, id: 1, email: 1, staffRole: 1, churchIds: 1, templeIds: 1 } }
  );

  return buildDonationsReadScope(member, true, email);
}

export function mergeDonationIdWithScope(
  id: string,
  scope: DonationsScope
): Record<string, unknown> {
  if (scope.kind === 'open') {
    return { id };
  }
  if (scope.kind === 'none') {
    return { id, churchId: '__no_church_access__' };
  }
  return { $and: [{ id }, scope.filter] };
}
