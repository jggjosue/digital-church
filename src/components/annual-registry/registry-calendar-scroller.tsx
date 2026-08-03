import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = { children: ReactNode; minWidth?: number; className?: string };

export function RegistryCalendarScroller({ children, minWidth = 760, className }: Props) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-2 text-xs text-muted-foreground sm:hidden">Desliza horizontalmente para ver todos los días y categorías.</p>
      <div className="touch-pan-x overflow-x-auto overscroll-x-contain pb-2">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}
