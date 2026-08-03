'use client';

import { AlertTriangle, CheckCircle2, Copy, ListPlus, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { RegistryImportMode, RegistryImportPreviewData } from '@/lib/annual-registry';

type Props = {
  preview: RegistryImportPreviewData | null;
  mode: RegistryImportMode;
  onModeChange: (mode: RegistryImportMode) => void;
  onCancel: () => void;
  onApply: () => void;
  applying?: boolean;
  formatTotal?: (value: number) => string;
};

export function RegistryImportPreview({ preview, mode, onModeChange, onCancel, onApply, applying, formatTotal = String }: Props) {
  if (!preview) return null;
  const valid = preview.rows.filter((row) => row.valid);
  const invalid = preview.rows.filter((row) => !row.valid);
  const duplicates = preview.rows.filter((row) => row.duplicate);
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !applying) onCancel(); }}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b p-5 pb-4">
          <DialogTitle>Vista previa de importación</DialogTitle>
          <DialogDescription className="break-all">{preview.fileName}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(92vh-190px)] px-5">
          <div className="space-y-5 py-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { Icon: CheckCircle2, label: 'Válidas', value: valid.length, color: 'text-emerald-600' },
                { Icon: AlertTriangle, label: 'Inválidas', value: invalid.length, color: 'text-destructive' },
                { Icon: Copy, label: 'Duplicados', value: duplicates.length, color: 'text-amber-600' },
                { Icon: ListPlus, label: 'Categorías nuevas', value: preview.newCategories.length, color: 'text-sky-600' },
                { Icon: Sigma, label: 'Total', value: formatTotal(preview.total), color: 'text-primary' },
              ].map(({ Icon, label, value, color }) => (
                <div key={label} className="rounded-xl border bg-muted/30 p-3">
                  <Icon className={cn('h-4 w-4', color)} />
                  <p className="mt-2 text-xs text-muted-foreground">{label}</p>
                  <p className="break-words text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Cómo aplicar los valores</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => onModeChange('replace')} className={cn('rounded-xl border p-4 text-left', mode === 'replace' && 'border-primary bg-primary/5 ring-1 ring-primary')}><p className="font-semibold">Reemplazar</p><p className="text-xs text-muted-foreground">El archivo sustituye el valor existente de cada celda.</p></button>
                <button type="button" onClick={() => onModeChange('sum')} className={cn('rounded-xl border p-4 text-left', mode === 'sum' && 'border-primary bg-primary/5 ring-1 ring-primary')}><p className="font-semibold">Sumar</p><p className="text-xs text-muted-foreground">El valor importado se añade al que ya está registrado.</p></button>
              </div>
            </div>

            {preview.newCategories.length ? <div><p className="text-sm font-semibold">Categorías nuevas detectadas</p><div className="mt-2 flex flex-wrap gap-2">{preview.newCategories.map((category) => <span key={category} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">{category}</span>)}</div></div> : null}

            {invalid.length ? <div><p className="text-sm font-semibold">Filas que no serán importadas</p><div className="mt-2 overflow-hidden rounded-xl border">{invalid.slice(0, 50).map((row) => <div key={row.rowNumber} className="grid grid-cols-[70px_1fr] gap-3 border-b p-3 text-sm last:border-0"><span className="font-semibold">Fila {row.rowNumber}</span><span className="text-muted-foreground">{row.reason || 'Datos incorrectos'}</span></div>)}</div>{invalid.length > 50 ? <p className="mt-2 text-xs text-muted-foreground">Se muestran las primeras 50 filas inválidas.</p> : null}</div> : null}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t p-4"><Button variant="outline" onClick={onCancel} disabled={applying}>Cancelar</Button><Button onClick={onApply} disabled={applying || valid.length === 0}>{applying ? 'Aplicando…' : `Aplicar ${valid.length} filas`}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
