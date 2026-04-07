'use client';

import * as React from 'react';
import {
  filterSidebarNavByModules,
  portalEntriesToSidebarItems,
  type SidebarNavItem,
} from '@/lib/portal-nav-data';

type PortalNavContextValue = {
  navItems: SidebarNavItem[];
  loading: boolean;
};

function relabelMembersNew(navItems: SidebarNavItem[], label: string): SidebarNavItem[] {
  return navItems.map((item) => {
    if (!('subItems' in item) || !item.subItems) return item;
    return {
      ...item,
      subItems: item.subItems.map((sub) =>
        sub.href === '/members/new' ? { ...sub, label } : sub
      ),
    };
  });
}

const PortalNavContext = React.createContext<PortalNavContextValue>({
  navItems: portalEntriesToSidebarItems(),
  loading: true,
});

export function PortalNavProvider({ children }: { children: React.ReactNode }) {
  const [navItems, setNavItems] = React.useState<SidebarNavItem[]>(() =>
    portalEntriesToSidebarItems()
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/members/me-nav', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          access?: string;
          modules?: Record<string, string[]>;
          staffRole?: string | null;
        };
        if (cancelled) return;
        const base = portalEntriesToSidebarItems();
        const filtered =
          data.access === 'partial' && data.modules && typeof data.modules === 'object'
            ? filterSidebarNavByModules(base, data.modules)
            : base;
        const role = String(data.staffRole ?? '').trim().toLowerCase();
        const shouldShowMyData = role === 'nuevo' || role === 'congregante';
        setNavItems(shouldShowMyData ? relabelMembersNew(filtered, 'Mis datos') : filtered);
      } catch {
        if (!cancelled) setNavItems(portalEntriesToSidebarItems());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = React.useMemo(() => ({ navItems, loading }), [navItems, loading]);

  return <PortalNavContext.Provider value={value}>{children}</PortalNavContext.Provider>;
}

export function usePortalNav() {
  return React.useContext(PortalNavContext);
}
