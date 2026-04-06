'use client';

import Link from 'next/link';
import { BookHeart, ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { prayerRequestsData } from '@/lib/data';

export function PrayerRequestsManageCard() {
  const count = prayerRequestsData.length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookHeart className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Peticiones de oración</CardTitle>
              <CardDescription className="mt-1">
                Registre nuevas peticiones y revise el listado con filtros y estados.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/prayer/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva petición
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/prayer">
                <ListChecks className="mr-2 h-4 w-4" />
                Ver y gestionar
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{count}</span>
          {count === 1 ? ' petición en el listado' : ' peticiones en el listado'} (datos de ejemplo).
        </p>
      </CardContent>
    </Card>
  );
}
