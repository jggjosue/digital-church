'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';
import type { MinistryDocument, MinistryLeader } from '@/lib/ministries';
import { leadersRegisteredForMinistry } from '@/lib/ministries';
import { useToast } from '@/hooks/use-toast';

export default function EditMinistryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [ministry, setMinistry] = React.useState<MinistryDocument | null>(null);
  const [allMinistries, setAllMinistries] = React.useState<MinistryDocument[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'error' | 'ready'>('loading');
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<string>('');
  const [referenceMinistryId, setReferenceMinistryId] = React.useState('');
  const [leaders, setLeaders] = React.useState<MinistryLeader[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredLeaders, setFilteredLeaders] = React.useState<MinistryLeader[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    void fetch('/api/ministries', { cache: 'no-store', headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d: { ministries?: MinistryDocument[] }) => {
        if (!cancelled) setAllMinistries(d.ministries ?? []);
      })
      .catch(() => {
        if (!cancelled) setAllMinistries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!id?.trim()) {
      setLoadState('error');
      setErrMsg('Identificador no válido.');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setErrMsg(null);
      try {
        const res = await fetch(`/api/ministries/${encodeURIComponent(id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ministry?: MinistryDocument;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo cargar el ministerio.');
        }
        if (cancelled) return;
        if (!data.ministry) {
          setLoadState('error');
          setErrMsg('No se recibieron datos.');
          return;
        }
        const m = data.ministry;
        setMinistry(m);
        setName(m.name);
        setDescription(m.description);
        setCategory(m.category);
        setLeaders(m.leaders.map((l) => ({ ...l })));
        setReferenceMinistryId(m.id);
        setLoadState('ready');
      } catch (e) {
        if (!cancelled) {
          setLoadState('error');
          setErrMsg(e instanceof Error ? e.message : 'Error al cargar.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  React.useEffect(() => {
    if (!searchTerm.trim() || !referenceMinistryId) {
      setFilteredLeaders([]);
      setHighlightedIndex(-1);
      return;
    }
    const pool = leadersRegisteredForMinistry(allMinistries, referenceMinistryId);
    const added = new Set(leaders.map((l) => String(l.id)));
    const q = searchTerm.toLowerCase();
    setFilteredLeaders(
      pool
        .filter(
          (l) =>
            !added.has(String(l.id)) &&
            (l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
        )
        .slice(0, 5)
    );
    setHighlightedIndex(-1);
  }, [searchTerm, leaders, referenceMinistryId, allMinistries]);

  const removeLeader = (leaderId: string) => {
    setLeaders((prev) => prev.filter((leader) => String(leader.id) !== leaderId));
  };

  const addLeader = (leader: MinistryLeader) => {
    setLeaders((prev) => [...prev, leader]);
    setSearchTerm('');
    setFilteredLeaders([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && leaders.length > 0) {
      const lastLeader = leaders[leaders.length - 1];
      removeLeader(String(lastLeader.id));
    } else if (filteredLeaders.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredLeaders.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredLeaders.length) % filteredLeaders.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredLeaders.length) {
          addLeader(filteredLeaders[highlightedIndex]);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!id?.trim() || !ministry) return;
    if (!name.trim() || !description.trim() || !category) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos',
        description: 'Complete nombre, descripción y categoría.',
      });
      return;
    }
    if (leaders.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sin líderes',
        description: 'Debe haber al menos un líder.',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/ministries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          leaders: leaders.map((l) => ({
            id: l.id,
            name: l.name,
            email: l.email,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar.');
      }
      toast({
        title: 'Cambios guardados',
        description: data.message || 'El ministerio se actualizó correctamente.',
      });
      router.push(`/ministries/${id}`);
      router.refresh();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'No se pudo guardar.',
      });
    } finally {
      setSaving(false);
    }
  };

  const searchDisabled =
    !referenceMinistryId || allMinistries.length === 0;

  if (loadState === 'loading') {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader title="Editar ministerio" description="Cargando…" />
        <main className="flex-1 p-8">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </main>
      </div>
    );
  }

  if (loadState === 'error' || !ministry) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader
          title="Ministerio no encontrado"
          description={errMsg ?? 'No existe este ministerio.'}
        />
        <main className="flex-1 p-8">
          <Button variant="outline" asChild>
            <Link href="/ministries">Volver a ministerios</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Editar Ministerio"
        description={`Modifique los detalles del ministerio «${name}».`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/ministries/${id}`}>Cancelar</Link>
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Detalles del Ministerio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ministry-name">Nombre del Ministerio</Label>
              <Input
                id="ministry-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría del Ministerio</Label>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Alcance Comunitario</SelectItem>
                  <SelectItem value="worship">Adoración</SelectItem>
                  <SelectItem value="youth">Jóvenes</SelectItem>
                  <SelectItem value="children">Niños</SelectItem>
                  <SelectItem value="care">Cuidado</SelectItem>
                  <SelectItem value="general">Sin categoría</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference-ministry">Ministerio (líderes desde base de datos)</Label>
              <Select
                value={referenceMinistryId || undefined}
                onValueChange={setReferenceMinistryId}
                disabled={allMinistries.length === 0}
              >
                <SelectTrigger id="reference-ministry">
                  <SelectValue placeholder="Seleccione un ministerio" />
                </SelectTrigger>
                <SelectContent>
                  {allMinistries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Al escribir en el buscador solo aparecen líderes ya registrados en MongoDB para el
                ministerio seleccionado (puede ser este u otro).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ministry-leaders">Líder(es) del Ministerio</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="ministry-leaders"
                  placeholder={
                    searchDisabled
                      ? 'Cargando ministerios o seleccione uno arriba…'
                      : 'Buscar entre líderes del ministerio seleccionado…'
                  }
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={searchDisabled}
                />
                {filteredLeaders.length > 0 ? (
                  <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-md border bg-background shadow-lg">
                    {filteredLeaders.map((member, index) => (
                      <div
                        key={String(member.id)}
                        className={cn(
                          'cursor-pointer p-2 hover:bg-accent',
                          index === highlightedIndex && 'bg-accent'
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addLeader(member);
                        }}
                      >
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 space-y-2">
                {leaders.map((leader) => (
                  <div
                    key={String(leader.id)}
                    className="flex items-center justify-between rounded-lg border bg-secondary p-2"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://picsum.photos/seed/${encodeURIComponent(String(leader.id))}/32/32`}
                          alt={leader.name}
                        />
                        <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      type="button"
                      onClick={() => removeLeader(String(leader.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
