'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Building,
  Heart,
  LayoutDashboard,
  Loader2,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { PORTAL_PERMISSIONS_BY_MODULE } from '@/lib/portal-nav-data';

const permissions = PORTAL_PERMISSIONS_BY_MODULE;

const categoryIcons: Partial<Record<string, LucideIcon>> = {
  Panel: LayoutDashboard,
  Iglesias: Building,
  Ministerios: Building,
  Asistencia: BarChart,
  Ofrendas: Heart,
  Directorio: Users,
  Inventario: Package,
  Configuración: Settings,
};

function permissionIdSlug(category: string, suffix: string) {
  const base = `${category}-${suffix}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  const slug = base
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'perm';
}

function buildInitialSelection(): Record<string, Record<string, boolean>> {
  const s: Record<string, Record<string, boolean>> = {};
  for (const [category, perms] of Object.entries(permissions)) {
    s[category] = {};
    for (const p of perms) s[category][p] = false;
  }
  return s;
}

function modulesToSelection(
  modules: Record<string, string[]> | null | undefined
): Record<string, Record<string, boolean>> {
  const base = buildInitialSelection();
  if (!modules) return base;
  for (const [category, perms] of Object.entries(modules)) {
    if (!base[category]) continue;
    for (const perm of perms) {
      if (Object.prototype.hasOwnProperty.call(base[category], perm)) {
        base[category][perm] = true;
      }
    }
  }
  return base;
}

function selectionToModules(
  sel: Record<string, Record<string, boolean>>
): Record<string, string[]> {
  const modules: Record<string, string[]> = {};
  for (const [category, map] of Object.entries(sel)) {
    const picked = Object.entries(map)
      .filter(([, on]) => on)
      .map(([label]) => label);
    if (picked.length > 0) modules[category] = picked;
  }
  return modules;
}

type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type RoleRow = {
  id: string;
  name: string;
  description: string;
  modules: Record<string, string[]>;
};

function memberDisplayName(m: MemberRow | null): string {
  if (!m) return '';
  return `${String(m.firstName ?? '').trim()} ${String(m.lastName ?? '').trim()}`.trim() || m.email;
}

export default function EditPortalRolePage() {
  const params = useParams<{ id: string }>();
  const memberId = String(params?.id ?? '').trim();
  const { toast } = useToast();
  const router = useRouter();

  const [roleId, setRoleId] = React.useState('');
  const [roleName, setRoleName] = React.useState('');
  const [roleDescription, setRoleDescription] = React.useState('');
  const [selection, setSelection] = React.useState(buildInitialSelection);
  const [member, setMember] = React.useState<MemberRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [nameError, setNameError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/settings/portal-users/${encodeURIComponent(memberId)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          member?: MemberRow;
          role?: RoleRow | null;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar la información.');
        if (cancelled) return;

        setMember(data.member ?? null);
        if (data.role) {
          setRoleId(data.role.id);
          setRoleName(String(data.role.name ?? ''));
          setRoleDescription(String(data.role.description ?? ''));
          setSelection(modulesToSelection(data.role.modules));
        } else {
          setRoleId('');
          setRoleName('');
          setRoleDescription('');
          setSelection(buildInitialSelection());
        }
      } catch (e) {
        if (!cancelled) {
          toast({
            variant: 'destructive',
            title: 'Error al cargar',
            description: e instanceof Error ? e.message : 'Inténtelo de nuevo.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [memberId, toast]);

  const handleSave = async () => {
    const trimmed = roleName.trim();
    if (!trimmed) {
      setNameError('El nombre del rol es obligatorio.');
      return;
    }
    const modules = selectionToModules(selection);
    if (Object.keys(modules).length === 0) {
      toast({
        variant: 'destructive',
        title: 'Seleccione permisos',
        description: 'Marque al menos un permiso en algún módulo.',
      });
      return;
    }
    if (!memberId) {
      toast({
        variant: 'destructive',
        title: 'Usuario inválido',
        description: 'No se encontró el identificador del usuario.',
      });
      return;
    }

    setSaving(true);
    try {
      const endpoint = roleId ? `/api/staff-roles/${encodeURIComponent(roleId)}` : '/api/staff-roles';
      const method = roleId ? 'PATCH' : 'POST';
      const payload = roleId
        ? {
            name: trimmed,
            description: roleDescription.trim(),
            modules,
            assignToMemberId: memberId,
          }
        : {
            name: trimmed,
            description: roleDescription.trim(),
            modules,
            assignToMemberId: memberId,
            assignToCurrentUser: false,
          };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar.');

      toast({
        title: roleId ? 'Rol actualizado' : 'Rol creado',
        description: `Se guardaron cambios para ${memberDisplayName(member)}.`,
      });
      router.push('/settings/users');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: e instanceof Error ? e.message : 'Intente de nuevo.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Editar Roles y Permisos"
        description="Actualice el rol y los permisos del usuario seleccionado."
      >
        <div className="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" asChild>
            <Link href="/settings/users">Cancelar</Link>
          </Button>
          <Button type="button" disabled={saving || loading} onClick={() => void handleSave()}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </AppHeader>

      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detalles del Rol</CardTitle>
              <CardDescription>
                {loading
                  ? 'Cargando usuario...'
                  : member
                    ? `Usuario: ${memberDisplayName(member)} (${member.email})`
                    : 'Usuario no encontrado.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Nombre del Rol</Label>
                <Input
                  id="role-name"
                  placeholder="Ej., Administrador de Contenido"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'role-name-error' : undefined}
                  disabled={loading}
                />
                {nameError ? (
                  <p id="role-name-error" className="text-sm text-destructive">
                    {nameError}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Descripción del Rol</Label>
                <Textarea
                  id="role-description"
                  placeholder="Describa lo que los usuarios con este rol pueden hacer."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Permisos</CardTitle>
              <CardDescription>Seleccione los permisos para este rol.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando permisos...
                </div>
              ) : (
                <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                  {Object.entries(permissions).map(([category, perms], index) => {
                    const CategoryIcon = categoryIcons[category];
                    const selectAllId = permissionIdSlug(category, 'select-all');
                    const catSel = selection[category] ?? {};
                    const checkedCount = perms.filter((p) => catSel[p]).length;
                    const allChecked = perms.length > 0 && checkedCount === perms.length;
                    const someChecked = checkedCount > 0 && checkedCount < perms.length;
                    const selectAllState: boolean | 'indeterminate' = allChecked
                      ? true
                      : someChecked
                        ? 'indeterminate'
                        : false;

                    const setCategoryAll = (on: boolean) => {
                      setSelection((prev) => {
                        const next = { ...prev, [category]: { ...prev[category] } };
                        for (const p of perms) next[category][p] = on;
                        return next;
                      });
                    };

                    return (
                      <AccordionItem key={category} value={`item-${index + 1}`}>
                        <AccordionTrigger className="font-semibold">
                          <span className="flex items-center gap-2">
                            {CategoryIcon ? (
                              <CategoryIcon
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                aria-hidden
                              />
                            ) : null}
                            {category}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                            <div className="col-span-1 flex items-center space-x-2 sm:col-span-2">
                              <Checkbox
                                id={selectAllId}
                                checked={selectAllState}
                                onCheckedChange={(v) => setCategoryAll(v === true)}
                              />
                              <label htmlFor={selectAllId} className="text-sm font-medium leading-none">
                                Seleccionar Todo
                              </label>
                            </div>
                            {perms.map((perm) => {
                              const permId = permissionIdSlug(category, perm);
                              return (
                                <div key={perm} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permId}
                                    checked={catSel[perm] ?? false}
                                    onCheckedChange={(v) =>
                                      setSelection((prev) => ({
                                        ...prev,
                                        [category]: {
                                          ...prev[category],
                                          [perm]: v === true,
                                        },
                                      }))
                                    }
                                  />
                                  <label htmlFor={permId} className="text-sm font-medium leading-none">
                                    {perm}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
