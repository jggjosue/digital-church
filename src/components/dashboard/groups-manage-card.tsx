'use client';

import Link from 'next/link';
import { ListChecks, Plus, UserPlus, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { groupData } from '@/lib/data';

export function GroupsManageCard() {
  const count = groupData.length;
  const activeCount = groupData.filter((g) => g.status === 'Activo').length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Agregar y gestionar grupos</CardTitle>
              <CardDescription className="mt-1">
                Cree grupos, revise el directorio y asigne miembros desde un solo lugar.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo grupo
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/groups">
                <ListChecks className="mr-2 h-4 w-4" />
                Gestionar lista
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/groups/add-members">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar miembros
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{count}</span>
          {count === 1 ? ' grupo en el listado' : ' grupos en el listado'}
          {activeCount > 0 ? (
            <>
              {' '}
              (<span className="font-semibold text-foreground">{activeCount}</span>
              {activeCount === 1 ? ' activo' : ' activos'})
            </>
          ) : null}
          . Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
