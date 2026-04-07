import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

/**
 * Envío vía Gmail (Google): configure en el entorno:
 * - GMAIL_USER: cuenta Gmail que envía (p. ej. tesoreria@tuiglesia.org si es Google Workspace)
 * - GMAIL_APP_PASSWORD: contraseña de aplicación (Google Cuenta → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones)
 * Opcional: GMAIL_FROM_NAME (nombre mostrado como remitente)
 */

const bodySchema = z.object({
  to: z.string().email('Correo no válido.'),
  pdfBase64: z.string().min(50),
  filename: z.string().max(200).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
});

function sanitizeFilename(name: string): string {
  let base = (name.trim() || 'estado-cuenta.pdf').replace(/[\\/:*?"<>|]/g, '_');
  if (!base.toLowerCase().endsWith('.pdf')) base = `${base}.pdf`;
  if (base.length > 180) base = `${base.slice(0, 176)}.pdf`;
  return base;
}

/** Convierte errores SMTP de Gmail en mensajes claros en español. */
function humanizeSmtpError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('application-specific password') ||
    lower.includes('534-5.7.9') ||
    lower.includes('invalidsecondfactor')
  ) {
    return (
      'Gmail exige una contraseña de aplicación, no su contraseña habitual. ' +
      'Active la verificación en 2 pasos en su cuenta de Google, cree una contraseña de aplicación ' +
      '(Seguridad → Contraseñas de aplicaciones) y péguela en GMAIL_APP_PASSWORD en .env. ' +
      'GMAIL_USER debe ser exactamente el mismo correo de esa cuenta.'
    );
  }
  if (lower.includes('invalid login') || lower.includes('authentication failed')) {
    return (
      'Credenciales de Gmail incorrectas. Revise GMAIL_USER y GMAIL_APP_PASSWORD. ' +
      'Si tiene verificación en 2 pasos, use obligatoriamente una contraseña de aplicación.'
    );
  }
  return raw;
}

export async function POST(request: Request) {
  try {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') ?? '';

    if (!user || !pass) {
      return NextResponse.json(
        {
          error:
            'El envío por Gmail no está configurado. Defina GMAIL_USER y GMAIL_APP_PASSWORD en el entorno del servidor.',
        },
        { status: 503 }
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { to, pdfBase64, filename, year } = parsed.data;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(pdfBase64, 'base64');
    } catch {
      return NextResponse.json({ error: 'El PDF no es un Base64 válido.' }, { status: 400 });
    }

    if (buffer.length < 50) {
      return NextResponse.json({ error: 'El adjunto está vacío o es inválido.' }, { status: 400 });
    }
    if (buffer.length > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo supera el tamaño máximo permitido.' }, { status: 400 });
    }

    const attachmentName = sanitizeFilename(filename ?? 'estado-cuenta.pdf');
    const fromName = process.env.GMAIL_FROM_NAME?.trim() || 'Estado de cuenta — Donaciones';
    const subject =
      year != null
        ? `Estado de cuenta de donaciones (${year})`
        : 'Estado de cuenta de donaciones';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject,
      text: `Adjunto encontrará su declaración de donación en PDF (${attachmentName}).\n\nEste mensaje fue enviado desde la aplicación de la iglesia.`,
      attachments: [
        {
          filename: attachmentName,
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ ok: true, message: 'Correo enviado correctamente.' });
  } catch (e) {
    console.error('[api/giving-statement/send-email]', e);
    const raw = e instanceof Error ? e.message : String(e);
    const message = humanizeSmtpError(raw);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
