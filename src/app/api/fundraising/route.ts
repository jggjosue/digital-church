import type { Collection } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { FundraisingCampaignDoc, FundraisingStatus } from '@/lib/fundraising-seed';

const COLLECTION = 'fundraising';

const STATUSES: FundraisingStatus[] = ['Active', 'Completed', 'Upcoming', 'Draft'];

function computeProgress(raised: number, goal: number | null): number {
  if (goal == null || goal <= 0) return 0;
  return Math.round((raised / goal) * 100);
}

function slugifyBase(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'campana';
}

async function uniqueCampaignId(
  collection: Collection<FundraisingCampaignDoc>,
  base: string
): Promise<string> {
  let id = base;
  let n = 0;
  while (await collection.countDocuments({ id })) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection<FundraisingCampaignDoc>(COLLECTION);

    const campaigns = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray();

    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error('[api/fundraising GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
    }

    const name =
      typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'El título es obligatorio.' }, { status: 400 });
    }

    const description =
      typeof body.description === 'string' ? body.description.trim() : '';

    if (typeof body.status !== 'string' || !STATUSES.includes(body.status as FundraisingStatus)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }
    const status = body.status as FundraisingStatus;

    const raised = Number(body.raised);
    if (!Number.isFinite(raised) || raised < 0) {
      return NextResponse.json({ error: 'Monto recaudado inválido.' }, { status: 400 });
    }

    let goal: number | null = null;
    if (body.goal !== undefined && body.goal !== null) {
      const g = Number(body.goal);
      if (!Number.isFinite(g) || g < 0) {
        return NextResponse.json({ error: 'Meta inválida.' }, { status: 400 });
      }
      goal = g;
    }

    const date = typeof body.date === 'string' ? body.date.trim() : '';

    const db = await getDb();
    const collection = db.collection<FundraisingCampaignDoc>(COLLECTION);

    const baseId = slugifyBase(name);
    const id = await uniqueCampaignId(collection, baseId);

    const last = await collection.findOne({}, { sort: { sortOrder: -1 }, projection: { sortOrder: 1 } });
    const sortOrder = (last?.sortOrder ?? 0) + 1;

    const campaign: FundraisingCampaignDoc = {
      id,
      slug: id,
      name,
      description,
      status,
      raised,
      goal,
      progress: computeProgress(raised, goal),
      date,
      sortOrder,
    };

    await collection.insertOne(campaign);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (e) {
    console.error('[api/fundraising POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
