'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { PortalFooter } from '@/components/portal-footer';
import { PortalNavProvider } from '@/contexts/portal-nav-context';

const AUTH_ROUTE = /^\/(sign-in|sign-up)(\/|$)/;
const PUBLIC_CHROME_BYPASS_ROUTES = new Set<string>([
  '/documentacion',
  '/privacidad',
  '/terminos',
  '/cookies',
  '/privacy',
  '/terms',
  '/legal',
]);
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
  '/donations/registro',
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
  '/tutorial',
  '/prayer',
  '/prayer/new',
  '/prayer/groups',
]);

function isAllowedCongregantePath(pathname: string | null): boolean {
  if (!pathname) return false;
  const norm = pathname.replace(/\/+$/, '') || '/';
  if (norm === '/churches') return true;
  if (norm.startsWith('/churches/') && norm !== '/churches/new' && !norm.endsWith('/edit')) return true;
  if (norm === '/members/staff') return true;
  if (norm === '/members/new') return true;
  if (norm === '/donations/new') return true;
  if (norm === '/donations') return true;
  if (norm === '/donations/giving-statement') return true;
  if (norm === '/donations/fundraising' || norm.startsWith('/donations/fundraising/')) return true;
  if (norm === '/prayer' || norm.startsWith('/prayer/')) return true;
  if (norm === '/tutorial') return true;
  return false;
}

export function AuthenticatedChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [memberLookup, setMemberLookup] = React.useState<'idle' | 'exists' | 'missing'>('idle');
  const [roleChecked, setRoleChecked] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  const isAuthPage = pathname ? AUTH_ROUTE.test(pathname) : false;
  const isLandingHome = pathname === '/' || pathname === '';
  const normalizedPath = pathname?.replace(/\/+$/, '') || '/';
  const isPublicBypassRoute =
    PUBLIC_CHROME_BYPASS_ROUTES.has(normalizedPath) ||
    normalizedPath.startsWith('/privacidad/') ||
    normalizedPath.startsWith('/terminos/') ||
    normalizedPath.startsWith('/cookies/') ||
    normalizedPath.startsWith('/privacy/') ||
    normalizedPath.startsWith('/terms/') ||
    normalizedPath.startsWith('/legal/') ||
    normalizedPath.startsWith('/documentacion/');
  const showFooter = FOOTER_ROUTES.has(normalizedPath);
  const isMembersNewRoute = normalizedPath === '/members/new';
  const isAllowedForCongregante = isAllowedCongregantePath(pathname);

  React.useEffect(() => {
    let cancelled = false;
    if (isAuthPage || isLandingHome || isPublicBypassRoute) return;
    void (async () => {
      try {
        const meRes = await fetch('/api/members/me', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const meData = (await meRes.json().catch(() => ({}))) as { member?: { id?: string } | null };
        const hasMember = Boolean(meData.member?.id);
        if (!cancelled) {
          setMemberLookup(hasMember ? 'exists' : 'missing');
        }
        if (!hasMember) {
          if (!cancelled && !isMembersNewRoute) {
            router.replace('/members/new');
          }
          return;
        }

        if (isMembersNewRoute) {
          if (!cancelled) setRoleChecked(true);
          return;
        }

        const res = await fetch('/api/members/me-role', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          isNew?: boolean;
          isAdmin?: boolean;
          staffRole?: string | null;
        };
        const adminBypass = data.isAdmin === true;
        if (!cancelled && !adminBypass && data.isNew === true) {
          router.replace('/members/new');
          return;
        }
        const role = String(data.staffRole ?? '')
          .trim()
          .toLowerCase();

        if (!cancelled) {
          setUserRole(role);
          setRoleChecked(true);
        }

        if (!cancelled && !adminBypass && role === 'congregante' && !isAllowedForCongregante) {
          router.replace('/churches');
        }
      } catch {
        if (!cancelled) {
          setRoleChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthPage, isLandingHome, isMembersNewRoute, isPublicBypassRoute, isAllowedForCongregante, pathname, router]);

  if (isAuthPage || isLandingHome || isPublicBypassRoute) {
    return <>{children}</>;
  }

  const showMembersOnlyPanel = isMembersNewRoute && memberLookup !== 'exists';
  if (showMembersOnlyPanel) {
    return <>{children}</>;
  }

  // Prevent UI flash or rendering of unauthorized pages for congregantes
  if (userRole === 'congregante' && !isAllowedForCongregante) {
    return null;
  }

  if (!roleChecked && !isAllowedForCongregante) {
    return null;
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
