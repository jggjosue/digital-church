'use client';

import type { ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Option = { id: string; name: string };

type Props = {
  churches: Option[];
  churchId: string;
  onChurchChange: (value: string) => void;
  churchState: 'loading' | 'ready' | 'error';
  year: string;
  years: string[];
  onYearChange: (value: string) => void;
  churchLabel?: string;
  yearLabel?: string;
  placeholder?: string;
  loadingPlaceholder?: string;
  className?: string;
  children?: ReactNode;
};

export function RegistrySelector({ churches, churchId, onChurchChange, churchState, year, years, onYearChange, churchLabel, yearLabel, placeholder = 'Selecciona un templo', loadingPlaceholder = 'Cargando templos...', className, children }: Props) {
  return (
    <div className={cn('grid w-full gap-3 md:grid-cols-2', className)}>
      <div className="min-w-0 space-y-2">
        {churchLabel ? <p className="text-sm font-medium text-muted-foreground">{churchLabel}</p> : null}
        <Select value={churchId} onValueChange={onChurchChange} disabled={churchState !== 'ready' || churches.length === 0}>
          <SelectTrigger className="w-full"><SelectValue placeholder={churchState === 'loading' ? loadingPlaceholder : placeholder} /></SelectTrigger>
          <SelectContent>{churches.map((church) => <SelectItem key={church.id} value={church.id}>{church.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="min-w-0 space-y-2">
        {yearLabel ? <p className="text-sm font-medium text-muted-foreground">{yearLabel}</p> : null}
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona un año" /></SelectTrigger>
          <SelectContent>{years.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {children ? <div className="md:col-span-2">{children}</div> : null}
    </div>
  );
}
