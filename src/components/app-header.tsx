
'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
  stacked?: boolean;
}

export function AppHeader({ title, description, children, stacked = false }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-auto min-w-0 flex-col items-stretch gap-3 border-b bg-background/95 px-3 pb-3 pt-[calc(.75rem+env(safe-area-inset-top,0px))] backdrop-blur supports-[backdrop-filter]:bg-background/85 min-[380px]:px-4 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-[calc(1.5rem+env(safe-area-inset-top,0px))]',
        !stacked && 'sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="h-11 w-11 shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(92vw,28rem)] p-0 sm:max-w-md lg:hidden">
            <MobileSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <div className="break-words text-xl font-bold leading-tight min-[380px]:text-2xl sm:text-3xl">{title}</div>
          <div className="mt-1 break-words text-sm leading-snug text-muted-foreground sm:text-base">{description}</div>
        </div>
      </div>
      {children != null ? (
        <div
          className={cn(
            'flex w-full flex-col gap-2',
            !stacked && 'shrink-0 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end',
          )}
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}
