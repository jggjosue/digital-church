import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';

const ATTENDANCE_COLLECTION = 'attendance';

export type ChurchAttendanceEvent = {
  id: string;
  churchId: string;
  eventType: 'service' | 'event';
  eventName: string;
  attendanceMode: 'presencial' | 'online';
  eventWeekday: string | null;
  eventTime: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  notes: string;
  createdAt: string;
};

const createChurchAttendanceSchema = z.object({
  eventType: z.enum(['service', 'event']),
  eventName: z.string().min(1).max(200),
  attendanceMode: z.enum(['presencial', 'online']),
  eventWeekday: z.string().max(30).optional().default(''),
  eventTime: z.string().min(1).max(20),
  eventStartDate: z.string().max(100).optional().default(''),
  eventEndDate: z.string().max(100).optional().default(''),
  notes: z.string().max(3000).optional().default(''),
}).superRefine((value, ctx) => {
  if (value.eventType === 'service') {
    if (!value.eventWeekday.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventWeekday'],
        message: 'El día de la semana es requerido para servicios.',
      });
    }
  }
  if (value.eventType === 'event') {
    if (!value.eventStartDate.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventStartDate'],
        message: 'La fecha de inicio es requerida para eventos.',
      });
    }
  }
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }
    const db = await getDb();
    const records = await db
      .collection<ChurchAttendanceEvent>(ATTENDANCE_COLLECTION)
      .find({ churchId: id.trim() }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ records });
  } catch (e) {
    console.error('[api/churches/[id]/attendance GET]', e);
    const message =
      e instanceof Error ? e.message : 'Error al leer la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Id inválido.' }, { status: 400 });
    }
    const json = await request.json();
    const parsed = createChurchAttendanceSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const record: ChurchAttendanceEvent = {
      id: randomUUID(),
      churchId: id.trim(),
      eventType: body.eventType,
      eventName: body.eventName.trim(),
      attendanceMode: body.attendanceMode,
      eventWeekday: body.eventWeekday.trim() || null,
      eventTime: body.eventTime.trim(),
      eventStartDate: body.eventStartDate.trim() || null,
      eventEndDate: body.eventEndDate.trim() || null,
      notes: body.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    const db = await getDb();
    await db.collection<ChurchAttendanceEvent>(ATTENDANCE_COLLECTION).insertOne(record);
    return NextResponse.json(
      { ok: true, message: 'Servicio/evento registrado correctamente.', record },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/churches/[id]/attendance POST]', e);
    const message =
      e instanceof Error ? e.message : 'Error al guardar en la base de datos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
