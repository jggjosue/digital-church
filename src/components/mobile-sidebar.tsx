
'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useChurchIdentity } from '@/components/church-account-dropdown';
import { usePortalNav } from '@/contexts/portal-nav-context';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';

export function MobileSidebar() {
  const pathname = usePathname();
  const { name, subtitle } = useChurchIdentity();
  const { navItems } = usePortalNav();
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);

  const isSubItemActive = (subItems: { href: string }[]) => {
    return subItems.some((subItem) => pathname.startsWith(subItem.href));
  };

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
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
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {navItems.map((item) =>
          'subItems' in item && item.subItems ? (
            <Collapsible
              key={item.label}
              open={openCollapsibles.includes(item.label)}
              onOpenChange={() => toggleCollapsible(item.label)}
            >
              <CollapsibleTrigger asChild>
                <div
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    isSubItemActive(item.subItems) && 'bg-accent font-medium text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      openCollapsibles.includes(item.label) && 'rotate-180'
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                      pathname === subItem.href && 'bg-accent/50 text-accent-foreground'
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
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === item.href! && 'bg-accent font-medium text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        )}
      </nav>
      <div className="mt-auto space-y-1 p-4" />
    </div>
  );
}
