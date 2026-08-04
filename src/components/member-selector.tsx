'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export type MemberMinimal = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

interface MemberSelectorProps {
  multiple?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  selectedNames?: string[];
  onSelectedNamesChange?: (names: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MemberSelector({
  multiple = false,
  selectedIds = [],
  onSelectedIdsChange,
  selectedNames = [],
  onSelectedNamesChange,
  placeholder = 'Seleccionar miembro...',
  className,
}: MemberSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [members, setMembers] = React.useState<MemberMinimal[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch only once or when opened
  React.useEffect(() => {
    if (open && members.length === 0) {
      setIsLoading(true);
      fetch('/api/members?limit=1000') // fetch enough, or implement debounced search
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMembers(data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, members.length]);

  const filteredMembers = React.useMemo(() => {
    if (!query) return members;
    const lowerQuery = query.toLowerCase();
    return members.filter((m) => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      return fullName.includes(lowerQuery) || m.email?.toLowerCase().includes(lowerQuery);
    });
  }, [members, query]);

  const toggleMember = (member: MemberMinimal) => {
    const fullName = `${member.firstName} ${member.lastName}`.trim();
    if (multiple) {
      const isSelected = selectedIds.includes(member.id);
      if (isSelected) {
        onSelectedIdsChange?.(selectedIds.filter((id) => id !== member.id));
        onSelectedNamesChange?.(selectedNames.filter((name) => name !== fullName));
      } else {
        onSelectedIdsChange?.([...selectedIds, member.id]);
        onSelectedNamesChange?.([...selectedNames, fullName]);
      }
    } else {
      onSelectedIdsChange?.([member.id]);
      onSelectedNamesChange?.([fullName]);
      setOpen(false);
    }
  };

  const removeMember = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = selectedIds.indexOf(idToRemove);
    if (index > -1) {
      const newIds = [...selectedIds];
      newIds.splice(index, 1);
      const newNames = [...selectedNames];
      newNames.splice(index, 1);
      onSelectedIdsChange?.(newIds);
      onSelectedNamesChange?.(newNames);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            selectedIds.length === 0 && 'text-muted-foreground',
            multiple && selectedIds.length > 0 ? 'h-auto py-1.5' : '',
            className
          )}
        >
          {selectedIds.length === 0 ? (
            placeholder
          ) : multiple ? (
            <div className="flex flex-wrap gap-1">
              {selectedIds.map((id, index) => (
                <Badge key={id} variant="secondary" className="mr-1">
                  {selectedNames[index] || 'Desconocido'}
                  <div
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onClick={(e) => removeMember(id, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </div>
                </Badge>
              ))}
            </div>
          ) : (
            selectedNames[0] || 'Miembro seleccionado'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Buscar miembro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron miembros.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedIds.includes(member.id);
              const fullName = `${member.firstName} ${member.lastName}`.trim();
              return (
                <div
                  key={member.id}
                  className={cn(
                    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    isSelected && 'bg-accent text-accent-foreground font-medium'
                  )}
                  onClick={() => toggleMember(member)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{fullName}</span>
                    {member.email && (
                      <span className="text-xs text-muted-foreground font-normal">{member.email}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
