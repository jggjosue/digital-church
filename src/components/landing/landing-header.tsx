'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  LANDING_NAV_LINKS,
  LANDING_SCROLL_SECTION_IDS,
  type LandingScrollSectionId,
} from '@/components/landing/landing-nav-sections';
import { LandingHeaderActions } from '@/components/landing/landing-header-actions';
import { cn } from '@/lib/utils';

const BRAND = 'ICIAR';

function computeActiveSection(): LandingScrollSectionId | null {
  if (typeof window === 'undefined') return null;

  const headerEl = document.querySelector('header');
  const headerH = headerEl?.getBoundingClientRect().height ?? 64;
  /** Línea de lectura bajo el header (~12–15 % del viewport). */
  const y = headerH + window.innerHeight * 0.12;

  const containing: { id: LandingScrollSectionId; height: number }[] = [];
  for (const id of LANDING_SCROLL_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= y && r.bottom >= y) {
      containing.push({ id, height: r.height });
    }
  }

  if (containing.length > 0) {
    containing.sort((a, b) => a.height - b.height);
    return containing[0]!.id;
  }

  let last: LandingScrollSectionId | null = null;
  for (const id of LANDING_SCROLL_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= y) last = id;
  }
  return last;
}

export function LandingHeader() {
  const [activeId, setActiveId] = React.useState<LandingScrollSectionId | null>(null);

  React.useEffect(() => {
    const update = () => {
      setActiveId(computeActiveSection());
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:min-h-[4rem] sm:gap-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          {BRAND}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Secciones">
          {LANDING_NAV_LINKS.map(({ id, label }) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  'transition-colors',
                  active
                    ? 'font-semibold text-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                )}
              >
                {label}
              </a>
            );
          })}
        </nav>
        <LandingHeaderActions activeSectionId={activeId} />
      </div>
    </header>
  );
}
