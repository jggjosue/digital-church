
'use client';

import {
  Menu,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useChurchIdentity } from '@/components/church-account-dropdown';
import { usePortalNav } from '@/contexts/portal-nav-context';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function AppSidebar() {
  const pathname = usePathname();
  const { name, subtitle } = useChurchIdentity();
  const { navItems } = usePortalNav();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);

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
    <aside
      className={cn(
        'hidden min-h-screen shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-200 ease-in-out md:flex',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      <TooltipProvider>
        <div
          className={cn(
            'flex gap-3 border-b border-border/40 px-3 py-3',
            collapsed
              ? 'h-auto flex-col items-center justify-center'
              : 'h-16 flex-row items-center px-6'
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {!collapsed ? (
            <>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8 shrink-0',
                    userButtonPopoverCard: 'rounded-lg',
                  },
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{name}</p>
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex shrink-0">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                        userButtonPopoverCard: 'rounded-lg',
                      },
                    }}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <nav className={cn('flex-1 space-y-1 overflow-y-auto px-4 py-2', collapsed && 'hidden')}>
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
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                      pathname === item.href! && 'bg-accent font-medium text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          )}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
