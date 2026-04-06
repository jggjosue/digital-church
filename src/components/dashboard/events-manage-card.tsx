'use client';

import Link from 'next/link';
import { CalendarDays, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { events as churchEvents } from '@/lib/data';

export function EventsManageCard() {
  const count = churchEvents.length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Eventos y calendario</CardTitle>
              <CardDescription className="mt-1">
                Cree eventos nuevos, use el calendario mensual y organice las
                actividades de la iglesia.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo evento
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/events">
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendario y gestión
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/events/activities">
                <Sparkles className="mr-2 h-4 w-4" />
                Actividades
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{count}</span>
          {count === 1
            ? ' evento en el calendario'
            : ' eventos en el calendario'}
          . Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
