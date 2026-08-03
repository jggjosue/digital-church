
'use client';

import { BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useChurchIdentity } from '@/components/church-account-dropdown';
import { usePortalNav } from '@/contexts/portal-nav-context';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';

export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { name, subtitle } = useChurchIdentity();
  const { navItems } = usePortalNav();
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);
  const handleNavigate = () => window.setTimeout(() => onNavigate?.(), 0);

  const isSubItemActive = (subItems: { href: string }[]) => {
    return subItems.some((subItem) => pathname.startsWith(subItem.href));
  };

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [label]
    );
  };

  React.useEffect(() => {
    const activeItem = navItems.find(
      (item) => 'subItems' in item && item.subItems && isSubItemActive(item.subItems)
    );
    if (activeItem && 'label' in activeItem) {
      setOpenCollapsibles((prev) => {
        if (prev.includes(activeItem.label)) {
          return prev;
        }
        return [...prev, activeItem.label];
      });
    }
  }, [pathname, navItems]);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex min-h-16 items-center gap-3 border-b px-4 py-3">
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
      <nav aria-label="Navegación principal" className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
        {navItems.map((item) =>
          'subItems' in item && item.subItems ? (
            <Collapsible
              key={item.label}
              open={openCollapsibles.includes(item.label)}
              onOpenChange={() => toggleCollapsible(item.label)}
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  aria-expanded={openCollapsibles.includes(item.label)}
                  aria-controls={`mobile-submenu-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                  className={cn(
                    'flex min-h-12 w-full touch-manipulation items-center justify-between gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-base text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.99] sm:min-h-14 sm:text-lg',
                    isSubItemActive(item.subItems) && 'bg-accent font-medium text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      openCollapsibles.includes(item.label) && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent id={`mobile-submenu-${item.label.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-2 px-2 pb-2 pt-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={handleNavigate}
                    className={cn(
                      'flex min-h-12 touch-manipulation items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-14 sm:text-base',
                      pathname === subItem.href && 'border-primary/30 bg-primary/10 font-medium text-foreground'
                    )}
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              onClick={handleNavigate}
              className={cn(
                'flex min-h-12 touch-manipulation items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-base text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.99] sm:min-h-14 sm:text-lg',
                pathname === item.href! && 'bg-accent font-medium text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <span>{item.label}</span>
            </Link>
          )
        )}
        <Link href="/tutorial" onClick={handleNavigate} className={cn('flex min-h-12 touch-manipulation items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-base text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.99] sm:min-h-14 sm:text-lg', pathname === '/tutorial' && 'bg-accent font-medium text-accent-foreground')}><BookOpen className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" /><span>Tutorial</span></Link>
      </nav>
      <div className="mt-auto space-y-1 p-4" />
    </div>
  );
}
