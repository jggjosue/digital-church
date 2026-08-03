'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type FieldTransform = 'string' | 'number' | 'csv' | 'checked';
type FieldDefinition = string | { selector: string; transform?: FieldTransform; fallback?: unknown };

type Props = React.ComponentProps<typeof Button> & {
  resource: string;
  fields: Record<string, FieldDefinition>;
  extra?: Record<string, unknown>;
  successHref?: string;
};

function readField(definition: FieldDefinition) {
  const config = typeof definition === 'string' ? { selector: definition } : definition;
  const element = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>(config.selector);
  if (!element) return config.fallback ?? '';
  if (config.transform === 'checked') return 'checked' in element ? Boolean(element.checked) : false;
  const raw = 'value' in element && element.value ? element.value : element.textContent?.trim() ?? '';
  if (!raw) return config.fallback ?? '';
  if (config.transform === 'number') return Number(raw);
  if (config.transform === 'csv') return raw.split(',').map((value) => value.trim()).filter(Boolean);
  return raw;
}

export function ResourceSaveButton({ resource, fields, extra, successHref, children, disabled, ...buttonProps }: Props) {
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function save() {
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(fields).map(([key, definition]) => [key, readField(definition)]));
      const response = await fetch(`/api/data/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ...extra }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el registro.');
      toast({ title: 'Registro guardado', description: 'La información se guardó correctamente en MongoDB.' });
      if (successHref) router.push(successHref);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button {...buttonProps} type="button" onClick={save} disabled={disabled || saving}>
      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
