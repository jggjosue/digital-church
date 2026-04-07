import { type ReactNode, Suspense } from 'react';

export default function InventarioNuevoLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">Cargando…</div>}>
      {children}
    </Suspense>
  );
}
