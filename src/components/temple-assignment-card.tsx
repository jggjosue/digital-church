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
import {
  dedupeChurchesById,
  formatChurchLocationLine,
  type ChurchLocation,
  type ChurchSelectOption,
} from '@/lib/church-locations';

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
  /** Templos reales en BD (sin contar la opción «Otro»). */
  const [churchCount, setChurchCount] = React.useState(0);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templos</CardTitle>
        <CardDescription>
          Marque él o los templos en los que se congrega habitualmente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="mt-2 max-h-60 space-y-3 overflow-y-auto rounded-md border p-4">
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
              ? options.map((temple) => {
                  const inputId = `${fieldIdPrefix}-${temple.id}`;
                  const checked = selectedIds.includes(temple.id);
                  return (
                    <div key={temple.id} className="flex items-start gap-3">
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={() => onToggle(temple.id)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={inputId}
                        className="cursor-pointer font-normal leading-snug"
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
          <p className="text-xs text-muted-foreground">
            Puede seleccionar uno o más templos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
