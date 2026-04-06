'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { LANDING_NAV_LINKS } from '@/components/landing/landing-nav-sections';
import type { LandingScrollSectionId } from '@/components/landing/landing-nav-sections';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  activeSectionId?: LandingScrollSectionId | null;
};

export function LandingHeaderActions({ activeSectionId = null }: Props) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div
        className="flex h-9 w-28 animate-pulse items-center justify-end rounded-md bg-slate-100 sm:w-52"
        aria-hidden
      />
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isSignedIn ? (
        <Button
          size="sm"
          className="rounded-lg border-blue-200 bg-white font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          asChild
        >
          <Link href="/dashboard">Ir al panel</Link>
        </Button>
      ) : (
        <>
          <Button variant="ghost" size="sm" className="hidden text-slate-600 sm:inline-flex" asChild>
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-blue-600 px-3 font-semibold text-white shadow-sm hover:bg-blue-700 sm:px-4"
            asChild
          >
            <Link href="/sign-up">Comenzar</Link>
          </Button>
        </>
      )}
      <details className="relative md:hidden [&_summary::-webkit-details-marker]:hidden">
        <summary
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </summary>
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          {LANDING_NAV_LINKS.map(({ id, label }) => {
            const active = activeSectionId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  'block px-4 py-2.5 text-sm font-medium hover:bg-slate-50',
                  active ? 'font-semibold text-blue-600' : 'text-slate-700'
                )}
              >
                {label}
              </a>
            );
          })}
          <div className="my-2 border-t border-slate-100" />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="block px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-slate-50"
            >
              Ir al panel
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="block px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-slate-50"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </details>
    </div>
  );
}
