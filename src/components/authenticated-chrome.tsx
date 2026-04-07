'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { PortalFooter } from '@/components/portal-footer';
import { PortalNavProvider } from '@/contexts/portal-nav-context';

const AUTH_ROUTE = /^\/(sign-in|sign-up)(\/|$)/;
const FOOTER_ROUTES = new Set([
  '/dashboard',
  '/churches/new',
  '/churches',
  '/ministries/new',
  '/ministries',
  '/ministries/assign-members',
  '/attendance',
  '/attendance/registro',
  '/attendance/report',
  '/donations/new',
  '/donations/fundraising/new',
  '/donations',
  '/donations/giving-statement',
  '/donations/fundraising',
  '/members/new',
  '/members',
  '/members/staff',
  '/inventario',
  '/inventario/nuevo',
  '/settings/new',
  '/settings/roles',
  '/settings/users',
]);

export function AuthenticatedChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname ? AUTH_ROUTE.test(pathname) : false;
  const isLandingHome = pathname === '/' || pathname === '';
  const normalizedPath = pathname?.replace(/\/+$/, '') || '/';
  const showFooter = FOOTER_ROUTES.has(normalizedPath);
  const isMembersNewRoute = normalizedPath === '/members/new';

  React.useEffect(() => {
    let cancelled = false;
    if (isAuthPage || isLandingHome || isMembersNewRoute) return;
    void (async () => {
      try {
        const res = await fetch('/api/members/me-role', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          isNew?: boolean;
          staffRole?: string | null;
        };
        if (!cancelled && data.isNew === true) {
          router.replace('/members/new');
          return;
        }
        const role = String(data.staffRole ?? '')
          .trim()
          .toLowerCase();
        if (!cancelled && role === 'congregante' && pathname !== '/churches') {
          router.replace('/churches');
        }
      } catch {
        // Si falla la validación, no interrumpe la navegación normal.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthPage, isLandingHome, isMembersNewRoute, router]);

  if (isAuthPage || isLandingHome) {
    return <>{children}</>;
  }

  return (
    <PortalNavProvider>
      <div className="flex min-h-dvh w-full">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
          {/*showFooter ? <PortalFooter /> : null*/}
        </div>
      </div>
    </PortalNavProvider>
  );
}
