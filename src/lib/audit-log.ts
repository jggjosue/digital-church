import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Db } from 'mongodb';

export const AUDIT_LOG_COLLECTION = 'audit_log';
export const FINANCIAL_VERSIONS_COLLECTION = 'financial_record_versions';
export const REGISTRY_VERSIONS_COLLECTION = 'annual_registry_versions';

export type AuditAction = 'create' | 'update' | 'delete';

async function resolveActor() {
  const { userId } = await auth();
  const user = userId ? await currentUser().catch(() => null) : null;
  return {
    id: userId ?? 'unknown',
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || null : null,
  };
}

function screenFromRequest(request: Request, fallback: string) {
  const explicit = request.headers.get('x-source-screen')?.trim();
  if (explicit?.startsWith('/')) return explicit.slice(0, 300);
  const referer = request.headers.get('referer');
  if (referer) {
    try { return new URL(referer).pathname.slice(0, 300); } catch { /* usa respaldo */ }
  }
  return fallback;
}

export async function recordAudit(args: {
  db: Db;
  request: Request;
  action: AuditAction;
  collection: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  sourceScreen?: string;
}) {
  const actor = await resolveActor();
  const timestamp = new Date().toISOString();
  await args.db.collection(AUDIT_LOG_COLLECTION).insertOne({
    id: randomUUID(),
    action: args.action,
    collection: args.collection,
    entityId: args.entityId,
    actor,
    sourceScreen: screenFromRequest(args.request, args.sourceScreen ?? `/api/${args.collection}`),
    timestamp,
    before: args.before ?? null,
    after: args.after ?? null,
  });
  return { actor, timestamp };
}

export async function archiveVersion(args: {
  db: Db;
  request: Request;
  collection: string;
  entityId: string;
  document: unknown;
  versionCollection?: string;
  reason: 'update' | 'delete';
  sourceScreen?: string;
}) {
  const actor = await resolveActor();
  const archivedAt = new Date().toISOString();
  await args.db.collection(args.versionCollection ?? FINANCIAL_VERSIONS_COLLECTION).insertOne({
    id: randomUUID(),
    sourceCollection: args.collection,
    entityId: args.entityId,
    reason: args.reason,
    sourceScreen: screenFromRequest(args.request, args.sourceScreen ?? `/api/${args.collection}`),
    archivedBy: actor,
    archivedAt,
    snapshot: args.document,
  });
}

export function isFinancialCollection(collection: string) {
  return ['donation', 'offering_registry', 'financial_transactions', 'budgets', 'funds', 'pledges'].includes(collection);
}
