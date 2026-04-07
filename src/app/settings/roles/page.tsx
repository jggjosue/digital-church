'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StaffRoleRow = {
  id: string;
  name: string;
  description: string;
  modules: Record<string, string[]>;
  createdAt: string;
};

export default function SettingsRolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<StaffRoleRow[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      try {
        const res = await fetch('/api/staff-roles', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json().catch(() => ({}))) as {
          roles?: StaffRoleRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los roles.');
        if (!cancelled) {
          setRoles(json.roles ?? []);
          setLoadState('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setRoles([]);
          setLoadState('error');
          toast({
            variant: 'destructive',
            title: 'Error al cargar',
            description: e instanceof Error ? e.message : 'Inténtelo de nuevo.',
          });
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader title="Lista de Roles" description="Roles guardados en la colección staff_roles.">
        <Button asChild>
          <Link href="/settings/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Rol
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardHeader>
            {loadState === 'loading' ? (
              <p className="text-sm text-muted-foreground">Cargando roles…</p>
            ) : null}
            {loadState === 'error' ? (
              <p className="text-sm text-destructive">No se pudieron cargar los roles.</p>
            ) : null}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Permisos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadState === 'ready' && roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      No hay roles registrados.
                    </TableCell>
                  </TableRow>
                ) : null}
                {roles.map((role) => {
                  const moduleCount = Object.keys(role.modules ?? {}).length;
                  const permissionCount = Object.values(role.modules ?? {}).reduce(
                    (acc, items) => acc + items.length,
                    0
                  );
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || '—'}</TableCell>
                      <TableCell>{moduleCount}</TableCell>
                      <TableCell>{permissionCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
