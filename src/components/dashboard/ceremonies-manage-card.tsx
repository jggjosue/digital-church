'use client';

import Link from 'next/link';
import { BookHeart, Download, ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ceremonyData } from '@/lib/data';

export function CeremoniesManageCard() {
  const count = ceremonyData.length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookHeart className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Ceremonias y registros</CardTitle>
              <CardDescription className="mt-1">
                Gestione ceremonias, agregue nuevos registros y exporte la
                informacion para reportes.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/ceremonies/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva ceremonia
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/ceremonies">
                <ListChecks className="mr-2 h-4 w-4" />
                Registros
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/ceremonies/export">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{count}</span>
          {count === 1
            ? ' ceremonia registrada'
            : ' ceremonias registradas'}
          . Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
