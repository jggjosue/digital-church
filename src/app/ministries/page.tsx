'use client';

import * as React from 'react';
import { MoreHorizontal, Plus, Search, Users, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import type { MinistryDocument } from '@/lib/ministries';
import { ministryCategoryLabel } from '@/lib/ministries';

function leaderSummary(ministry: MinistryDocument): string {
  if (ministry.leaders.length === 0) return 'Sin líder';
  if (ministry.leaders.length === 1) return ministry.leaders[0].name;
  return `${ministry.leaders[0].name} +${ministry.leaders.length - 1}`;
}

export default function MinistriesPage() {
  const [ministries, setMinistries] = React.useState<MinistryDocument[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'members'>('name');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setLoadError(null);
      try {
        const res = await fetch('/api/ministries', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ministries?: MinistryDocument[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar los ministerios.');
        }
        if (!cancelled) {
          setMinistries(data.ministries ?? []);
          setLoadState('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setLoadState('error');
          setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSorted = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = ministries;
    if (q) {
      list = list.filter((m) => {
        const cat = ministryCategoryLabel(m.category).toLowerCase();
        const leaders = m.leaders.map((l) => `${l.name} ${l.email}`).join(' ').toLowerCase();
        const hay = `${m.name} ${m.description} ${cat} ${leaders}`;
        return hay.includes(q);
      });
    }
    const out = [...list];
    if (sortBy === 'name') {
      out.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else {
      out.sort((a, b) => b.memberCount - a.memberCount);
    }
    return out;
  }, [ministries, searchQuery, sortBy]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Ministerios"
        description="Gestione los ministerios de la iglesia y sus miembros."
      >
        <Button asChild>
          <Link href="/ministries/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Ministerio
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ministerios..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar ministerios"
            />
          </div>
          <div className="w-full sm:w-[220px]">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'members')}>
              <SelectTrigger aria-label="Ordenar lista">
                <SelectValue placeholder="Ordenar por: Nombre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Ordenar por: Nombre</SelectItem>
                <SelectItem value="members">Ordenar por: Miembros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadState === 'loading' ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Cargando ministerios…</p>
        ) : null}
        {loadState === 'error' ? (
          <p className="mt-8 text-center text-sm text-destructive">{loadError}</p>
        ) : null}

        {loadState === 'ready' && filteredSorted.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {ministries.length === 0
              ? 'No hay ministerios registrados. Cree uno con «Añadir Nuevo Ministerio».'
              : 'Ningún ministerio coincide con la búsqueda.'}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-6">
          {filteredSorted.map((ministry) => (
            <Card key={ministry.id}>
              <CardContent className="p-6">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                  <div>
                    <h3 className="text-xl font-bold">{ministry.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ministryCategoryLabel(ministry.category)}
                    </p>
                    <p className="mt-1 text-muted-foreground">{ministry.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 sm:mt-0" type="button">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {ministry.memberCount} Miembros
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Líder: {leaderSummary(ministry)}
                    </div>
                    <div className="flex items-center">
                      {ministry.leaders.slice(0, 5).map((leader) => (
                        <Avatar
                          key={leader.id}
                          className="-ml-2 h-8 w-8 border-2 border-card first:ml-0"
                        >
                          <AvatarImage
                            src={`https://picsum.photos/seed/${encodeURIComponent(leader.id)}/40/40`}
                            alt={leader.name}
                          />
                          <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {ministry.memberCount > 5 ? (
                        <Avatar className="-ml-2 h-8 w-8 border-2 border-card bg-muted text-muted-foreground">
                          <AvatarFallback>+{ministry.memberCount - 5}</AvatarFallback>
                        </Avatar>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row">
                    <Button className="w-full sm:w-auto" asChild>
                      <Link href={`/ministries/${ministry.id}`}>Ver Detalles</Link>
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                      <Link href={`/ministries/assign-members?ministryId=${encodeURIComponent(ministry.id)}`}>
                        Asignar Miembros
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
