'use client';

import { Clock3, RotateCcw, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type Props = {
  dirty: boolean;
  lastSavedAt: Date | null;
  autoSave: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  autoSaving: boolean;
  onUndo: () => void;
};

export function RegistryDraftStatus({ dirty, lastSavedAt, autoSave, onAutoSaveChange, autoSaving, onUndo }: Props) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        <span className={dirty ? 'rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800' : 'rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800'}>{dirty ? 'Cambios pendientes' : 'Sin cambios pendientes'}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock3 className="h-4 w-4" />{lastSavedAt ? `Último guardado: ${lastSavedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : 'Sin guardar en esta sesión'}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm"><Switch checked={autoSave} onCheckedChange={onAutoSaveChange} /><Sparkles className="h-4 w-4" />Autoguardado</label>
        {autoSaving ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Save className="h-3.5 w-3.5 animate-pulse" />Guardando…</span> : null}
        <Button type="button" size="sm" variant="outline" disabled={!dirty || autoSaving} onClick={onUndo}><RotateCcw className="mr-2 h-4 w-4" />Deshacer cambios</Button>
      </div>
    </div>
  );
}
