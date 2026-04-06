'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, ListChecks, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { MinistryDocument } from '@/lib/ministries';

export function MinistriesManageCard() {
  const [count, setCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ministries', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ministries?: MinistryDocument[];
        };
        if (!cancelled) {
          if (res.ok) {
            setCount(data.ministries?.length ?? 0);
          } else {
            setCount(null);
          }
        }
      } catch {
        if (!cancelled) setCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Agregar y gestionar ministerios</CardTitle>
              <CardDescription className="mt-1">
                Cree ministerios, edite datos y asigne miembros desde un solo lugar.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/ministries/new">
                <Plus className="mr-2 h-4 w-4" />
                Añadir ministerio
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/ministries">
                <ListChecks className="mr-2 h-4 w-4" />
                Gestionar lista
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/ministries/assign-members">
                <Users className="mr-2 h-4 w-4" />
                Asignar miembros
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        {loading ? (
          <span className="animate-pulse">Cargando resumen…</span>
        ) : count !== null ? (
          <p>
            <span className="font-semibold text-foreground">{count}</span>
            {count === 1 ? ' ministerio registrado' : ' ministerios registrados'} en la base de datos.
          </p>
        ) : (
          <p>No se pudo obtener el total. Puede seguir usando las acciones de arriba.</p>
        )}
      </CardContent>
    </Card>
  );
}
