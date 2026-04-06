import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

/**
 * Comprueba que la conexión con MongoDB (STORAGE_MONGODB_URI / MONGO_DB) funciona.
 * Solo para uso interno / despliegue; no exponer en producción sin protección si no es necesario.
 */
export async function GET() {
  try {
    const client = await getMongoClient();
    await client.db('admin').command({ ping: 1 });
    return NextResponse.json({ ok: true, message: 'MongoDB responde correctamente.' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json(
      { ok: false, message },
      { status: 503 }
    );
  }
}
