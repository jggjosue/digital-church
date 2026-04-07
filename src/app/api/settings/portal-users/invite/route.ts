import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';

const bodySchema = z.object({
  memberId: z.string().min(1),
});

function humanizeSmtpError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('application-specific password') ||
    lower.includes('534-5.7.9') ||
    lower.includes('invalidsecondfactor')
  ) {
    return (
      'Gmail exige una contraseña de aplicación. Revise la configuración de ' +
      'GMAIL_USER y GMAIL_APP_PASSWORD.'
    );
  }
  if (lower.includes('invalid login') || lower.includes('authentication failed')) {
    return 'Credenciales de Gmail incorrectas. Revise GMAIL_USER y GMAIL_APP_PASSWORD.';
  }
  return raw;
}

export async function POST(request: Request) {
  try {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') ?? '';
    if (!user || !pass) {
      return NextResponse.json(
        { error: 'El envío por Gmail no está configurado en el servidor.' },
        { status: 503 }
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await getDb();
    const member = await db.collection('members').findOne(
      { id: parsed.data.memberId.trim() },
      { projection: { _id: 0, firstName: 1, lastName: 1, email: 1 } }
    );
    if (!member || typeof member.email !== 'string' || !member.email.trim()) {
      return NextResponse.json(
        { error: 'No se encontró un correo válido para este usuario.' },
        { status: 404 }
      );
    }

    const to = member.email.trim().toLowerCase();
    const fullName = `${String(member.firstName ?? '').trim()} ${String(member.lastName ?? '').trim()}`
      .trim();
    const displayName = fullName || to;
    const origin = request.headers.get('origin')?.trim() || '';
    const signUpUrl = origin ? `${origin}/sign-up` : '/sign-up';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"ICIAR Plataforma" <${user}>`,
      to,
      subject: 'Invitación para unirte a ICIAR',
      text:
        `Hola ${displayName},\n\n` +
        'Has sido invitado(a) a unirte a la plataforma ICIAR.\n' +
        `Para crear tu cuenta, ingresa aquí: ${signUpUrl}\n\n` +
        'Si ya tienes cuenta, puedes iniciar sesión con tu correo.\n\n' +
        'Equipo ICIAR',
      html:
        `<p>Hola <strong>${displayName}</strong>,</p>` +
        '<p>Has sido invitado(a) a unirte a la plataforma <strong>ICIAR</strong>.</p>' +
        `<p><a href="${signUpUrl}">Haz clic aquí para crear tu cuenta</a>.</p>` +
        '<p>Si ya tienes cuenta, puedes iniciar sesión con tu correo.</p>' +
        '<p>Equipo ICIAR</p>',
    });

    return NextResponse.json({ ok: true, message: 'Invitación enviada correctamente.' });
  } catch (e) {
    console.error('[api/settings/portal-users/invite POST]', e);
    const raw = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: humanizeSmtpError(raw) }, { status: 500 });
  }
}
