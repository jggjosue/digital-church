
'use client';

import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useChurchIdentity } from '@/components/church-account-dropdown';
import { usePortalNav } from '@/contexts/portal-nav-context';

import { cn } from '@/lib/utils';
export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { name, subtitle } = useChurchIdentity();
  const { navItems } = usePortalNav();
  const [selectedMenu, setSelectedMenu] = React.useState<string | null>(null);
  const handleNavigate = () => window.setTimeout(() => onNavigate?.(), 0);

  const isSubItemActive = (subItems: { href: string }[]) => {
    return subItems.some((subItem) => pathname.startsWith(subItem.href));
  };

  const activeGroup = navItems.find(
    (item) => 'subItems' in item && item.subItems && item.label === selectedMenu
  );

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex min-h-20 items-center gap-3 border-b px-5 py-4 pr-14">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 shrink-0',
              userButtonPopoverCard: 'rounded-lg',
            },
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {activeGroup && 'subItems' in activeGroup && activeGroup.subItems ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedMenu(null)}
              className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-5 w-5" />
              Todos los menús
            </button>
            <div className="flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <activeGroup.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opciones de</p>
                <h2 className="text-xl font-bold">{activeGroup.label}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
              {activeGroup.subItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={handleNavigate}
                  className={cn(
                    'flex min-h-20 touch-manipulation items-center gap-4 rounded-2xl border bg-card p-4 text-sm font-semibold shadow-sm transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pathname === subItem.href && 'border-primary/40 bg-primary/10 text-primary'
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <subItem.icon className="h-5 w-5" />
                  </span>
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="px-1">
              <h2 className="text-xl font-bold">¿A dónde deseas ir?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Selecciona un menú para ver sus opciones.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {navItems.map((item) =>
          'subItems' in item && item.subItems ? (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelectedMenu(item.label)}
              className={cn(
                'flex min-h-28 touch-manipulation flex-col items-start justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.99]',
                isSubItemActive(item.subItems) && 'border-primary/40 bg-primary/10'
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </span>
              <span className="flex w-full items-end justify-between gap-2 font-semibold">
                <span>{item.label}</span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              onClick={handleNavigate}
              className={cn(
                'flex min-h-28 touch-manipulation flex-col items-start justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.99]',
                pathname === item.href! && 'border-primary/40 bg-primary/10 text-primary'
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><item.icon className="h-6 w-6" /></span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          )
        )}
        <Link href="/tutorial" onClick={handleNavigate} className={cn('flex min-h-28 touch-manipulation flex-col items-start justify-between rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', pathname === '/tutorial' && 'border-primary/40 bg-primary/10 text-primary')}><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><BookOpen className="h-6 w-6" /></span><span className="font-semibold">Tutorial</span></Link>
            </div>
          </div>
        )}
      </nav>
      <div className="mt-auto space-y-1 p-4" />
    </div>
  );
}
