import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const ATTENDANCE_EVENTS_COLLECTION = 'attendance_events';

type AttendanceEventRow = {
  eventName?: string;
  eventType?: 'service' | 'event';
  createdAt?: string;
};

/**
 * Servicios y eventos configurados en `/attendance/[id]` para el templo seleccionado.
 * La consulta queda aislada por `churchId`, igual que `/attendance/[id]`.
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
    const attendanceEvents = await db
      .collection<AttendanceEventRow>(ATTENDANCE_EVENTS_COLLECTION)
      .find(
        {
          churchId,
          eventType: { $in: ['service', 'event'] },
        },
        { projection: { _id: 0, eventName: 1, eventType: 1, createdAt: 1 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    const names: string[] = [];
    const normalizedNames = new Set<string>();
    const addName = (raw: unknown) => {
      const name = String(raw ?? '').trim();
      if (!name) return;
      const key = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (normalizedNames.has(key)) return;
      normalizedNames.add(key);
      names.push(name);
    };

    // Mismo conjunto y orden reciente que se muestra en `/attendance/[id]`.
    for (const event of attendanceEvents) addName(event.eventName);

    return NextResponse.json({ names });
  } catch (e) {
    console.error('[api/attendance/registro/event-names GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
