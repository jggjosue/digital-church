'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeMinistryName } from '@/lib/ministries';

type MemberCustomMinistryProps = {
  existingOptions: string[];
  onCreated: (ministry: { id: string; name: string }) => void;
};

export function MemberCustomMinistry({ existingOptions, onCreated }: MemberCustomMinistryProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    const cleanedName = name.trim().replace(/\s+/g, ' ');
    if (!cleanedName) {
      setError('Escriba el nombre del grupo o ministerio.');
      return;
    }
    const normalized = normalizeMinistryName(cleanedName);
    const duplicate = existingOptions.find(
      (option) => normalizeMinistryName(option) === normalized
    );
    if (duplicate) {
      setError(`“${duplicate}” ya existe. Escriba un nombre diferente.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/ministries/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: cleanedName }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        ministry?: { id: string; name: string };
        error?: string;
      };
      if (!response.ok || !json.ministry) {
        throw new Error(json.error || 'No se pudo guardar el grupo o ministerio.');
      }
      onCreated(json.ministry);
      setName('');
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md border border-dashed p-3">
      <div className="flex items-center gap-3">
        <Checkbox
          id="member-ministry-other"
          checked={open}
          onCheckedChange={(checked) => {
            setOpen(checked === true);
            setError(null);
          }}
        />
        <Label htmlFor="member-ministry-other" className="cursor-pointer font-normal">
          Otro
        </Label>
      </div>
      {open ? (
        <div className="mt-3 space-y-2 pl-8">
          <Label htmlFor="member-ministry-other-name">Nombre del grupo o ministerio</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="member-ministry-other-name"
              value={name}
              maxLength={200}
              placeholder="Escriba un nombre"
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void save();
                }
              }}
              disabled={saving}
              autoFocus
            />
            <Button type="button" onClick={() => void save()} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
