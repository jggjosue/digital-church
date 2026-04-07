'use client';

import * as React from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type CategoryRow = { id: string; name: string };

function newCategoryRow(): CategoryRow {
  return { id: crypto.randomUUID(), name: '' };
}

export default function InventarioNuevaCategoriaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = React.useState<CategoryRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  const backHref = '/inventario/nuevo';

  const updateRow = (index: number, name: string) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, name } : row)));
  };

  const removeRow = (index: number) => {
    setRows((r) => r.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((r) => [...r, newCategoryRow()]);
  };

  const save = async () => {
    setSaving(true);
    let lastValue: string | undefined;
    try {
      const seedRes = await fetch('/api/resource/seed-default-categories', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      const seedJson = (await seedRes.json().catch(() => ({}))) as {
        count?: number;
        error?: string;
      };
      if (!seedRes.ok) {
        throw new Error(seedJson.error || 'No se pudo actualizar la colección resource.');
      }

      const labels = rows.map((r) => r.name.trim()).filter(Boolean);
      if (labels.length === 0) {
        toast({
          title: 'Categorías base actualizadas',
          description: `Se guardaron ${seedJson.count ?? 15} categorías en la base de datos (colección resource). Añada nombres arriba si desea crear categorías personalizadas.`,
        });
        router.push(backHref);
        router.refresh();
        return;
      }

      for (const label of labels) {
        const res = await fetch('/api/inventory/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ label }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          category?: { value: string };
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error || `No se pudo crear «${label}».`);
        }
        lastValue = json.category?.value ?? lastValue;
      }

      toast({
        title: labels.length > 1 ? 'Categorías creadas' : 'Categoría creada',
        description: `Lista base sincronizada en resource (${seedJson.count ?? 15} categorías). Las nuevas ya puede usarlas al añadir recursos.`,
      });
      if (lastValue && labels.length === 1) {
        router.push(`/inventario/nuevo?categoria=${encodeURIComponent(lastValue)}`);
      } else {
        router.push(backHref);
      }
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader
        title="Nueva categoría"
        description="Defina categorías que aún no estén en la lista para clasificar recursos del inventario."
      >
        <Button variant="outline" type="button" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/30 p-4 sm:p-8">
        <Card className="mx-auto max-w-xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Nueva categoría</CardTitle>
            <CardDescription>
              Cada fila es una categoría disponible al añadir recursos al inventario.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay categorías aún. Use «Añadir categoría» para crear la primera.
              </p>
            ) : null}
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.id} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`cat-${row.id}`}>Nombre de la categoría</Label>
                    <Input
                      id={`cat-${row.id}`}
                      value={row.name}
                      onChange={(e) => updateRow(index, e.target.value)}
                      placeholder="Ej. Equipo deportivo"
                      maxLength={200}
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label="Eliminar categoría"
                    onClick={() => removeRow(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              onClick={addRow}
            >
              <Plus className="h-4 w-4" />
              Añadir categoría
            </Button>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              {saving ? (
                <Button type="button" variant="outline" disabled>
                  Cancelar
                </Button>
              ) : (
                <Button type="button" variant="outline" asChild>
                  <Link href={backHref}>Cancelar</Link>
                </Button>
              )}
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar categorías'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
