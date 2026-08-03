import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { resolvePortalModules } from '@/lib/portal-permissions';

export async function GET() {
  try {
    const modules = await resolvePortalModules(await getDb());
    return NextResponse.json({ access: modules === null ? 'full' : 'partial', modules: modules ?? {} });
  } catch {
    return NextResponse.json({ access: 'partial', modules: {} });
  }
}
