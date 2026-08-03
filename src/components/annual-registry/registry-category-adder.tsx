'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  noun?: string;
};

export function RegistryCategoryAdder({ value, onChange, onAdd, noun = 'categoría' }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed p-4 sm:flex-row">
      <Input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onAdd(); }} placeholder={`Nueva ${noun}`} />
      <Button type="button" variant="secondary" disabled={!value.trim()} onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Agregar {noun}</Button>
    </div>
  );
}
