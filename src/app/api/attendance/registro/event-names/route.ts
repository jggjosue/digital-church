import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const ATTENDANCE_REGISTRY_COLLECTION = 'attendance';

type Row = { eventName?: string; year?: string };

/**
 * Nombres de evento ya usados en registros de asistencia anual del templo.
 * Prioriza el año solicitado; incluye otros años del mismo templo para reutilizar nombres.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const churchId = url.searchParams.get('churchId')?.trim() ?? '';
    const year = url.searchParams.get('year')?.trim() ?? '';
    if (!churchId) {
      return NextResponse.json({ error: 'churchId es requerido.' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(year)) {
      return NextResponse.json({ error: 'year debe ser un año de 4 dígitos.' }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection<Row>(ATTENDANCE_REGISTRY_COLLECTION)
      .find({ churchId }, { projection: { _id: 0, eventName: 1, year: 1 } })
      .toArray();

    const meta = new Map<string, { sameYear: boolean }>();
    for (const d of docs) {
      const n = String(d.eventName ?? '').trim();
      if (!n) continue;
      const sameYear = String(d.year ?? '').trim() === year;
      const prev = meta.get(n);
      if (!prev) meta.set(n, { sameYear });
      else if (sameYear) meta.set(n, { sameYear: true });
    }

    const names = [...meta.entries()]
      .sort((a, b) => {
        if (a[1].sameYear !== b[1].sameYear) return a[1].sameYear ? -1 : 1;
        return a[0].localeCompare(b[0], 'es', { sensitivity: 'base' });
      })
      .map(([n]) => n);

    return NextResponse.json({ names });
  } catch (e) {
    console.error('[api/attendance/registro/event-names GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
