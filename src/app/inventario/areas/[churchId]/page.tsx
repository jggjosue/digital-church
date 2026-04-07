'use client';

import * as React from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChurchInventoryArea, ChurchLocation } from '@/lib/church-locations';
import { useToast } from '@/hooks/use-toast';

function newAreaRow(): ChurchInventoryArea {
  return { id: crypto.randomUUID(), name: '' };
}

export default function InventarioAreasPorTemploPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const churchId =
    typeof params?.churchId === 'string'
      ? params.churchId
      : Array.isArray(params?.churchId)
        ? params.churchId[0]
        : '';

  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [churchName, setChurchName] = React.useState('');
  const [rows, setRows] = React.useState<ChurchInventoryArea[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!churchId?.trim()) {
      setLoadState('error');
      setLoadError('Identificador de templo no válido.');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      setLoadError(null);
      try {
        const [resChurch, resAreas] = await Promise.all([
          fetch(`/api/churches/${encodeURIComponent(churchId)}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          }),
          fetch(
            `/api/inventory/church-areas?churchId=${encodeURIComponent(churchId)}`,
            {
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            }
          ),
        ]);
        const churchJson = (await resChurch.json().catch(() => ({}))) as {
          church?: ChurchLocation;
          error?: string;
        };
        const areasJson = (await resAreas.json().catch(() => ({}))) as {
          exists?: boolean;
          churchName?: string;
          areas?: ChurchInventoryArea[];
          error?: string;
        };
        if (!resChurch.ok) {
          throw new Error(churchJson.error || 'No se pudo cargar el templo.');
        }
        const c = churchJson.church;
        if (!c || cancelled) return;
        setChurchName(c.name);
        if (resAreas.ok && areasJson.exists) {
          const list = areasJson.areas ?? [];
          setRows(list.length > 0 ? list.map((a) => ({ ...a })) : []);
        } else {
          const legacy = c.inventoryAreas ?? [];
          setRows(legacy.length > 0 ? legacy.map((a) => ({ ...a })) : []);
        }
        setLoadState('ready');
      } catch (e) {
        if (cancelled) return;
        setLoadState('error');
        setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [churchId]);

  const updateRow = (index: number, name: string) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, name } : row)));
  };

  const removeRow = (index: number) => {
    setRows((r) => r.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((r) => [...r, newAreaRow()]);
  };

  const save = async () => {
    if (!churchId?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory/church-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          churchId,
          churchName,
          areas: rows,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || 'No se pudieron guardar las áreas.');
      }
      toast({
        title: 'Áreas guardadas',
        description: 'Los datos se guardaron en la colección inventory.',
      });
      router.push(`/inventario/nuevo?iglesia=${encodeURIComponent(churchId)}`);
      router.refresh();
    } catch (e) {
      toast({
        title: 'Error al guardar',
        description: e instanceof Error ? e.message : 'Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const backToNuevo = `/inventario/nuevo?iglesia=${encodeURIComponent(churchId)}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader
        title="Áreas de inventario por templo"
        description={
          loadState === 'ready'
            ? `Defina salas o zonas dentro de «${churchName}» para asignar recursos.`
            : 'Cargando…'
        }
      >
        <Button variant="outline" type="button" asChild>
          <Link href={churchId ? backToNuevo : '/inventario/nuevo'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/30 p-4 sm:p-8">
        {loadState === 'error' ? (
          <p className="text-center text-sm text-destructive">{loadError}</p>
        ) : null}

        {loadState === 'loading' ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : null}

        {loadState === 'ready' ? (
          <Card className="mx-auto max-w-xl shadow-sm">
            <CardHeader>
              <CardTitle>{churchName}</CardTitle>
              <CardDescription>
                Cada fila es una ubicación (área) disponible al añadir recursos al inventario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay áreas aún. Use «Añadir área» para crear la primera.
                </p>
              ) : null}
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div key={row.id} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`area-${row.id}`}>Nombre del área</Label>
                      <Input
                        id={`area-${row.id}`}
                        value={row.name}
                        onChange={(e) => updateRow(index, e.target.value)}
                        placeholder="Ej. Salón juvenil"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      aria-label="Eliminar área"
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="w-full gap-2 sm:w-auto" onClick={addRow}>
                <Plus className="h-4 w-4" />
                Añadir área
              </Button>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                {saving ? (
                  <Button type="button" variant="outline" disabled>
                    Cancelar
                  </Button>
                ) : (
                  <Button type="button" variant="outline" asChild>
                    <Link href={backToNuevo}>Cancelar</Link>
                  </Button>
                )}
                <Button type="button" onClick={save} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar áreas'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
