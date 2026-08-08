'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type ConsentChoice = 'accepted' | 'rejected';

const COOKIE_NAME = 'iciar_cookie_consent';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function readConsent(): ConsentChoice | null {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1];

  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setIsReady(true);
  }, []);

  function saveConsent(choice: ConsentChoice) {
    document.cookie = `${COOKIE_NAME}=${choice}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;
    setConsent(choice);
  }

  return (
    <>
      {consent === 'accepted' && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}

      {isReady && consent === null && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/35 p-3 sm:items-center sm:p-6"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-description"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
          >
            <h2 id="cookie-consent-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Valoramos tu privacidad
            </h2>

            <p
              id="cookie-consent-description"
              className="mt-4 text-base leading-relaxed text-slate-600"
            >
              Usamos cookies esenciales para que el sitio funcione y, con tu permiso, cookies de
              medición para mejorar tu experiencia. Consulta nuestra{' '}
              <Link
                href="/cookies"
                className="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-800"
              >
                Política de cookies
              </Link>
              .
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => saveConsent('accepted')}
                className="h-12 rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-700"
              >
                Aceptar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => saveConsent('rejected')}
                className="h-12 rounded-lg border-slate-300 bg-white text-base font-semibold text-slate-800 hover:bg-slate-50 hover:text-slate-900"
              >
                Rechazar
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
