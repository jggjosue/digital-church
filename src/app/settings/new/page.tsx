
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
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';
import { PORTAL_PERMISSIONS_BY_MODULE } from '@/lib/portal-nav-data';
import { cn } from '@/lib/utils';

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

type MemberSearchHit = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

function memberDisplayName(m: MemberSearchHit) {
  return `${String(m.firstName ?? '').trim()} ${String(m.lastName ?? '').trim()}`.trim() || m.email;
}

const MEMBER_SEARCH_MIN = 2;
const MEMBER_SEARCH_DEBOUNCE_MS = 300;

export default function NewRolePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [roleName, setRoleName] = React.useState('');
  const [roleDescription, setRoleDescription] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [selection, setSelection] = React.useState(buildInitialSelection);
  const [assignToMe, setAssignToMe] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [memberQuery, setMemberQuery] = React.useState('');
  const [memberHits, setMemberHits] = React.useState<MemberSearchHit[]>([]);
  const [memberSearchLoading, setMemberSearchLoading] = React.useState(false);
  const [memberListOpen, setMemberListOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<MemberSearchHit | null>(null);
  const memberSearchWrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const q = memberQuery.trim();
    if (q.length < MEMBER_SEARCH_MIN) {
      setMemberHits([]);
      setMemberSearchLoading(false);
      return;
    }
    setMemberSearchLoading(true);
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/members?q=${encodeURIComponent(q)}&limit=20`,
            {
              signal: ac.signal,
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            }
          );
          const data = (await res.json().catch(() => ({}))) as {
            members?: MemberSearchHit[];
            error?: string;
          };
          if (!res.ok) throw new Error(data.error);
          const rows = (data.members ?? []).map((m) => ({
            id: m.id,
            firstName: String(m.firstName ?? ''),
            lastName: String(m.lastName ?? ''),
            email: String(m.email ?? ''),
          }));
          setMemberHits(rows);
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
          setMemberHits([]);
        } finally {
          if (!ac.signal.aborted) setMemberSearchLoading(false);
        }
      })();
    }, MEMBER_SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [memberQuery]);

  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const el = memberSearchWrapRef.current;
      if (el && !el.contains(e.target as Node)) setMemberListOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const handleCreateRole = async () => {
    const trimmed = roleName.trim();
    if (!trimmed) {
      setNameError('El nombre del rol es obligatorio.');
      toast({
        variant: 'destructive',
        title: 'Revise el formulario',
        description: 'Indique el nombre del rol.',
      });
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
    setNameError('');
    setSaving(true);
    try {
      const res = await fetch('/api/staff-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          description: roleDescription.trim(),
          modules,
          assignToMemberId: selectedMember?.id,
          assignToCurrentUser: selectedMember ? false : Boolean(assignToMe),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        id?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el rol.');
      }
      toast({
        title: 'Rol creado',
        description:
          data.message ||
          (selectedMember
            ? `El rol quedó guardado y aplicado a ${memberDisplayName(selectedMember)}.`
            : assignToMe
              ? 'El rol quedó guardado y aplicado a su usuario (si existe un miembro con su correo).'
              : 'El rol quedó guardado en la base de datos.'),
      });
      setSelection(buildInitialSelection());
      setRoleName('');
      setRoleDescription('');
      setSelectedMember(null);
      setMemberQuery('');
      setMemberHits([]);
      router.push('/settings/users');
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error al crear el rol',
        description: e instanceof Error ? e.message : 'Intente de nuevo.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Roles y Permisos"
        description="Defina un nuevo rol de usuario y configure sus permisos."
      >
        <div className="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" asChild>
            <Link href="/settings/users">Cancelar</Link>
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleCreateRole()}>
            {saving ? 'Guardando…' : 'Crear Rol'}
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detalles del Rol</CardTitle>
              <CardDescription>
                Proporcione un nombre y una breve descripción para este nuevo rol.
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
                />
                {nameError ? (
                  <p id="role-name-error" className="text-sm text-destructive" role="alert">
                    {nameError}
                  </p>
                ) : null}
              </div>

              <div ref={memberSearchWrapRef} className="space-y-2">
                <Label htmlFor="member-search">Buscar miembro</Label>
                <div className="relative">
                  <Input
                    id="member-search"
                    placeholder="Nombre, apellido o correo…"
                    value={memberQuery}
                    onChange={(e) => {
                      setMemberQuery(e.target.value);
                      setMemberListOpen(true);
                      if (selectedMember) setSelectedMember(null);
                    }}
                    onFocus={() => setMemberListOpen(true)}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={memberListOpen}
                    aria-controls="member-search-results"
                  />
                  {memberSearchLoading ? (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                    </div>
                  ) : null}
                  {memberListOpen &&
                  memberQuery.trim().length >= MEMBER_SEARCH_MIN &&
                  !selectedMember ? (
                    <ul
                      id="member-search-results"
                      role="listbox"
                      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
                    >
                      {memberHits.length === 0 && !memberSearchLoading ? (
                        <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados.</li>
                      ) : null}
                      {memberHits.map((m) => (
                        <li key={m.id} role="option">
                          <button
                            type="button"
                            className={cn(
                              'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm',
                              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none'
                            )}
                            onClick={() => {
                              setSelectedMember(m);
                              setMemberQuery('');
                              setMemberHits([]);
                              setMemberListOpen(false);
                            }}
                          >
                            <span className="font-medium">{memberDisplayName(m)}</span>
                            <span className="text-xs text-muted-foreground">{m.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {selectedMember ? (
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Miembro seleccionado: </span>
                      <span className="font-medium">{memberDisplayName(selectedMember)}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {selectedMember.email}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="Quitar selección"
                      onClick={() => setSelectedMember(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Escriba al menos {MEMBER_SEARCH_MIN} caracteres para buscar en la colección{' '}
                    <span className="font-mono">members</span>. Opcional: puede asignar el rol a esa
                    persona al guardar.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">Descripción del Rol</Label>
                <Textarea
                  id="role-description"
                  placeholder="Describa lo que los usuarios con este rol pueden hacer."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />
              </div>
              {selectedMember ? (
                <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Al guardar, el rol se aplicará al miembro seleccionado (
                  <span className="font-medium text-foreground">
                    {memberDisplayName(selectedMember)}
                  </span>
                  ).
                </p>
              ) : (
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <Checkbox
                    id="assign-to-me"
                    checked={assignToMe}
                    onCheckedChange={(v) => setAssignToMe(v === true)}
                  />
                  <label htmlFor="assign-to-me" className="text-sm leading-none">
                    Aplicar este rol a mi usuario (mismo correo que en Clerk y en la colección members).
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Permisos</CardTitle>
              <CardDescription>Seleccione los permisos para este rol.</CardDescription>
            </CardHeader>
            <CardContent>
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
                            <CategoryIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
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
                            <label
                              htmlFor={selectAllId}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
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
                                <label
                                  htmlFor={permId}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
