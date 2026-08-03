import { NextResponse } from 'next/server';
import { createResourceHandlers } from '@/lib/mongo-resource';
import { getResourceConfig } from '@/lib/resource-configs';

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  const config = getResourceConfig(resource);
  if (!config) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  return createResourceHandlers(config).GET(request);
}

export async function POST(request: Request, context: Context) {
  const { resource } = await context.params;
  const config = getResourceConfig(resource);
  if (!config) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  return createResourceHandlers(config).POST(request);
}
