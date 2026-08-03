'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeyRound, Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type StaffRoleRow = {
  id: string;
  name: string;
  description: string;
  modules: Record<string, string[]>;
  createdAt: string;
  updatedAt?: string;
  assignedUsers: number;
};

export default function SettingsRolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<StaffRoleRow[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = React.useState(0);

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
  }, [reloadKey, toast]);

  const totals = React.useMemo(() => ({
    permissions: roles.reduce((sum, role) => sum + Object.values(role.modules ?? {}).reduce((count, values) => count + values.length, 0), 0),
    users: roles.reduce((sum, role) => sum + (role.assignedUsers ?? 0), 0),
  }), [roles]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader title="Roles del portal" description="Consulta los permisos y usuarios asignados a cada rol.">
        <Button asChild>
          <Link href="/settings/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear rol
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 space-y-4 bg-muted/20 p-4 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-3 p-4"><ShieldCheck className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{roles.length}</p><p className="text-xs text-muted-foreground">Roles configurados</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><KeyRound className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totals.permissions}</p><p className="text-xs text-muted-foreground">Permisos concedidos</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totals.users}</p><p className="text-xs text-muted-foreground">Usuarios asignados</p></div></CardContent></Card></div>
        <Card>
          <CardHeader>
            {loadState === 'loading' ? (
              <p className="text-sm text-muted-foreground">Cargando roles…</p>
            ) : null}
            {loadState === 'error' ? (
              <div className="flex items-center justify-between gap-3"><p className="text-sm text-destructive">No se pudieron cargar los roles.</p><Button type="button" variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw className="mr-2 h-4 w-4" />Reintentar</Button></div>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="hidden md:block"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Usuarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadState === 'ready' && roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
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
                      <TableCell><Badge variant="secondary">{role.assignedUsers ?? 0}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
            <div className="grid gap-3 md:hidden">{loadState === 'ready' && roles.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No hay roles registrados.</p> : roles.map((role) => { const moduleCount = Object.keys(role.modules ?? {}).length; const permissionCount = Object.values(role.modules ?? {}).reduce((sum, values) => sum + values.length, 0); return <article key={role.id} className="rounded-xl border bg-background p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{role.name}</h2><p className="mt-1 text-sm text-muted-foreground">{role.description || 'Sin descripción'}</p></div><Badge variant="secondary">{role.assignedUsers ?? 0} usuarios</Badge></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-2.5 py-1">{moduleCount} módulos</span><span className="rounded-full bg-muted px-2.5 py-1">{permissionCount} permisos</span></div></article>; })}</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
