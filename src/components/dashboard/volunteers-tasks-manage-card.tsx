'use client';

import Link from 'next/link';
import {
  Calendar,
  ListChecks,
  ListTodo,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { volunteerAssignments, volunteersData } from '@/lib/data';

export function VolunteersTasksManageCard() {
  const volunteerCount = volunteersData.length;
  const assignmentCount = volunteerAssignments.length;
  const pendingCount = volunteerAssignments.filter(
    (a) => a.status === 'Pending'
  ).length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">
                Tareas y asignaciones (voluntariado)
              </CardTitle>
              <CardDescription className="mt-1">
                Revise tareas, planifique turnos y mantenga el directorio de
                voluntarios al día.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/volunteers/tasks">
                <ListTodo className="mr-2 h-4 w-4" />
                Tareas
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/volunteers/planning">
                <Calendar className="mr-2 h-4 w-4" />
                Planeación
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/volunteers/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo voluntario
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/volunteers">
                <ListChecks className="mr-2 h-4 w-4" />
                Gestionar voluntarios
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{volunteerCount}</span>
          {volunteerCount === 1
            ? ' voluntario en catálogo'
            : ' voluntarios en catálogo'}
          .{' '}
          <span className="font-semibold text-foreground">{assignmentCount}</span>
          {assignmentCount === 1
            ? ' asignación registrada'
            : ' asignaciones registradas'}
          {pendingCount > 0 ? (
            <>
              {' '}
              (<span className="font-semibold text-foreground">{pendingCount}</span>
              {pendingCount === 1 ? ' pendiente' : ' pendientes'})
            </>
          ) : null}
          . Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
