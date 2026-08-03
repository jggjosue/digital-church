import { NextResponse } from 'next/server';
import { createResourceItemHandlers } from '@/lib/mongo-resource';
import { getResourceConfig } from '@/lib/resource-configs';

type Context = { params: Promise<{ resource: string; id: string }> };

async function resolve(context: Context) {
  const params = await context.params;
  return { params, config: getResourceConfig(params.resource) };
}

export async function GET(request: Request, context: Context) {
  const { params, config } = await resolve(context);
  if (!config) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  return createResourceItemHandlers(config).GET(request, { params: Promise.resolve({ id: params.id }) });
}

export async function PATCH(request: Request, context: Context) {
  const { params, config } = await resolve(context);
  if (!config) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  return createResourceItemHandlers(config).PATCH(request, { params: Promise.resolve({ id: params.id }) });
}

export async function DELETE(request: Request, context: Context) {
  const { params, config } = await resolve(context);
  if (!config) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  return createResourceItemHandlers(config).DELETE(request, { params: Promise.resolve({ id: params.id }) });
}
