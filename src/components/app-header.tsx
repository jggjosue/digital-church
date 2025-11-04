
'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from '@/components/mobile-sidebar';

interface AppHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, description, children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-auto flex-col items-start gap-4 border-b bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex w-full sm:w-auto items-center justify-end gap-2">
        {children}
      </div>
    </header>
  );
}
