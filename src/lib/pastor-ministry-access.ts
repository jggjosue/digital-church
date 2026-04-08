import type { Db } from 'mongodb';
import type { MinistryDocument } from '@/lib/ministries';
import { isLeadershipStaffRole } from '@/lib/pastor-church-access';

type MemberDoc = { id?: string; staffRole?: string | null };

/**
 * Filtro Mongo para `ministries` cuando el usuario tiene rol de pastoral o dirección (mismo criterio que `isLeadershipStaffRole`):
 * solo filas donde figura como líder (`leaders.id` o `leaders.email`).
 */
export async function resolveExactPastorMinistryMongoFilter(
  db: Db,
  email: string | null | undefined
): Promise<Record<string, unknown> | null> {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized) return null;

  const member = await db.collection<MemberDoc>('members').findOne(
    { email: normalized },
    { projection: { _id: 0, id: 1, staffRole: 1 } }
  );
  if (!member || !isLeadershipStaffRole(member.staffRole)) {
    return null;
  }

  const mid = String(member.id ?? '').trim();
  const or: Record<string, unknown>[] = [
    { leaders: { $elemMatch: { email: normalized } } },
  ];
  if (mid) {
    or.push({ leaders: { $elemMatch: { id: mid } } });
  }

  return { $or: or };
}

export function exactPastorCanAccessMinistry(
  doc: MinistryDocument,
  memberId: string,
  email: string
): boolean {
  const e = email.trim().toLowerCase();
  const mid = memberId.trim();
  return doc.leaders.some((l) => {
    if (l.email.trim().toLowerCase() === e) return true;
    if (mid && String(l.id) === mid) return true;
    return false;
  });
}
