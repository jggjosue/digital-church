'use client';

import Link from 'next/link';
import { Building2, CalendarDays, ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function FacilitiesManageCard() {
  const hallsCount = 5;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Instalaciones y salones</CardTitle>
              <CardDescription className="mt-1">
                Gestione salones de los templos, disponibilidad y uso en el
                calendario de actividades.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/facilities/new">
                <Plus className="mr-2 h-4 w-4" />
                Registrar salón
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/facilities">
                <ListChecks className="mr-2 h-4 w-4" />
                Gestionar salones
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/facilities">
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendario
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{hallsCount}</span>{' '}
          salones en catálogo. Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
