'use client';

import Link from 'next/link';
import { BarChart3, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ReportsManageCard() {
  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Gestión de reportes</CardTitle>
              <CardDescription className="mt-1">
                Genere reportes clave de asistencia, membresía, finanzas y
                voluntariado desde un solo módulo.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generador de reportes
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/reports/volunteers">
                <Users className="mr-2 h-4 w-4" />
                Reporte de voluntarios
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>Incluye reportes PDF y filtros por modulo.</p>
      </CardContent>
    </Card>
  );
}
