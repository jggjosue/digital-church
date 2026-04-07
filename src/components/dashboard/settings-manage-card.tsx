'use client';

import Link from 'next/link';
import { List, Plus, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { rolesData } from '@/lib/data';

export function SettingsManageCard() {
  const rolesCount = rolesData.length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Configuración, roles y usuarios</CardTitle>
              <CardDescription className="mt-1">
                Administre permisos, cree nuevos roles y gestione usuarios del sistema.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/settings/users">
                <Users className="mr-2 h-4 w-4" />
                Usuarios
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/settings/new">
                <Plus className="mr-2 h-4 w-4" />
                Roles y Permisos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/settings/roles">
                <List className="mr-2 h-4 w-4" />
                Lista de Roles
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{rolesCount}</span>
          {rolesCount === 1 ? ' rol configurado' : ' roles configurados'}.
          Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
