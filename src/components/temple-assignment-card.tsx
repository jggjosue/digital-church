'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  dedupeChurchesById,
  formatChurchLocationLine,
  normalizeChurchName,
  type ChurchLocation,
  type ChurchSelectOption,
} from '@/lib/church-locations';
import { cn } from '@/lib/utils';

export type TempleOption = ChurchSelectOption;

function mapChurchToOption(c: ChurchLocation): TempleOption {
  return {
    id: c.id,
    name: c.name,
    municipality: formatChurchLocationLine(c),
  };
}

type TempleAssignmentCardProps = {
  selectedIds: string[];
  onToggle: (churchId: string) => void;
  /** Prefijo para `id`/`htmlFor` de checkboxes (evita colisiones si hay varios formularios). */
  fieldIdPrefix?: string;
};

export function TempleAssignmentCard({
  selectedIds,
  onToggle,
  fieldIdPrefix = 'member-church',
}: TempleAssignmentCardProps) {
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [options, setOptions] = React.useState<TempleOption[]>([]);
  const [query, setQuery] = React.useState('');
  /** Templos reales en BD (sin contar la opción «Otro»). */
  const [churchCount, setChurchCount] = React.useState(0);
  const [showCustomChurch, setShowCustomChurch] = React.useState(false);
  const [customChurchName, setCustomChurchName] = React.useState('');
  const [customChurchError, setCustomChurchError] = React.useState<string | null>(null);
  const [savingCustomChurch, setSavingCustomChurch] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      try {
        const res = await fetch('/api/churches', { cache: 'no-store' });
        const data = (await res.json().catch(() => ({}))) as {
          churches?: ChurchLocation[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setLoadState('error');
          setOptions([]);
          setChurchCount(0);
          return;
        }
        const list = dedupeChurchesById(data.churches ?? []);
        setChurchCount(list.length);
        setOptions(list.map(mapChurchToOption));
        setLoadState('ready');
      } catch {
        if (!cancelled) {
          setLoadState('error');
          setOptions([]);
          setChurchCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (loadState !== 'ready') return options;
    const q = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.name} ${o.municipality ?? ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return hay.includes(q);
    });
  }, [options, query, loadState]);

  const saveCustomChurch = async () => {
    const name = customChurchName.trim().replace(/\s+/g, ' ');
    if (!name) {
      setCustomChurchError('Escriba el nombre del templo.');
      return;
    }
    const normalized = normalizeChurchName(name);
    const duplicate = options.find((church) => normalizeChurchName(church.name) === normalized);
    if (duplicate) {
      setCustomChurchError(`“${duplicate.name}” ya existe. Escriba un nombre diferente.`);
      return;
    }

    setSavingCustomChurch(true);
    setCustomChurchError(null);
    try {
      const response = await fetch('/api/churches/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        church?: TempleOption;
        error?: string;
      };
      if (!response.ok || !json.church) {
        throw new Error(json.error || 'No se pudo guardar el templo.');
      }
      setOptions((current) => [...current, json.church!].sort((a, b) => a.name.localeCompare(b.name, 'es')));
      setChurchCount((count) => count + 1);
      onToggle(json.church.id);
      setCustomChurchName('');
      setShowCustomChurch(false);
      setQuery('');
    } catch (error) {
      setCustomChurchError(error instanceof Error ? error.message : 'No se pudo guardar el templo.');
    } finally {
      setSavingCustomChurch(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Templos</CardTitle>
        <CardDescription>
          Marque él o los templos en los que se congrega habitualmente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar templo..."
              className="h-11"
            />
            <div className="max-h-none space-y-1 overflow-visible rounded-md border bg-background p-3 pr-2 sm:max-h-60 sm:space-y-3 sm:overflow-y-auto sm:overscroll-contain sm:p-4">
            {loadState === 'loading' ? (
              <p className="text-sm text-muted-foreground">Cargando templos desde la base de datos…</p>
            ) : null}
            {loadState === 'error' ? (
              <p className="text-sm text-destructive">
                No se pudieron cargar los templos. Compruebe la conexión o vuelva a intentarlo.
              </p>
            ) : null}
            {loadState === 'ready' && churchCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay templos registrados en la colección `churches`. Añada ubicaciones en la
                sección de iglesias.
              </p>
            ) : null}
            {loadState === 'ready'
              ? filtered.map((temple) => {
                  const inputId = `${fieldIdPrefix}-${temple.id}`;
                  const checked = selectedIds.includes(temple.id);
                  return (
                    <div
                      key={temple.id}
                      className={cn(
                        'flex items-start gap-3 rounded-md px-2 py-2 transition-colors',
                        checked ? 'bg-muted/40' : 'hover:bg-muted/30'
                      )}
                    >
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={() => onToggle(temple.id)}
                        className="mt-0.5 h-5 w-5"
                      />
                      <Label
                        htmlFor={inputId}
                        className="cursor-pointer text-sm font-normal leading-snug"
                      >
                        <span className="block">{temple.name}</span>
                        {temple.municipality ? (
                          <span className="text-xs text-muted-foreground">
                            {temple.municipality}
                          </span>
                        ) : null}
                      </Label>
                    </div>
                  );
                })
              : null}
            </div>
            <div className="rounded-md border border-dashed p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`${fieldIdPrefix}-other`}
                  checked={showCustomChurch}
                  onCheckedChange={(checked) => {
                    setShowCustomChurch(checked === true);
                    setCustomChurchError(null);
                  }}
                />
                <Label htmlFor={`${fieldIdPrefix}-other`} className="cursor-pointer font-normal">
                  Otro
                </Label>
              </div>
              {showCustomChurch ? (
                <div className="mt-3 space-y-2 pl-8">
                  <Label htmlFor={`${fieldIdPrefix}-other-name`}>Nombre del templo</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id={`${fieldIdPrefix}-other-name`}
                      value={customChurchName}
                      maxLength={200}
                      placeholder="Escriba el nombre del templo"
                      onChange={(event) => {
                        setCustomChurchName(event.target.value);
                        setCustomChurchError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void saveCustomChurch();
                        }
                      }}
                      disabled={savingCustomChurch}
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={() => void saveCustomChurch()}
                      disabled={savingCustomChurch}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {savingCustomChurch ? 'Guardando...' : 'Agregar'}
                    </Button>
                  </div>
                  {customChurchError ? (
                    <p className="text-sm text-destructive" role="alert">{customChurchError}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Puede seleccionar uno o más templos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
