
'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from '@/components/mobile-sidebar';

interface AppHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}

export function AppHeader({ title, description, children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-auto flex-col items-stretch gap-4 border-b bg-background px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6 sm:pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <div className="break-words text-2xl font-bold sm:text-3xl">{title}</div>
          <div className="mt-1 text-muted-foreground">{description}</div>
        </div>
      </div>
      {children != null ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {children}
        </div>
      ) : null}
    </header>
  );
}
