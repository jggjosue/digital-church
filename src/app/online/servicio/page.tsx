'use client';

import * as React from 'react';
import {
  Church,
  Clock,
  Link2,
  Plus,
  Search,
  Trash2,
  Wifi,
  Users,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ParticipatingChurch = { id: string; name: string };

type OnlineEvent = {
  id: string;
  name: string;
  category: string;
  description: string;
  platform: string;
  scheduledAt: string;
  recurrence: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'concurrent';
  weekday: string;
  weekdays: string[];
  meetingLink: string;
  participatingChurches: ParticipatingChurch[];
  notes: string;
  createdAt: string;
};

const RECURRENCE_LABELS: Record<string, string> = {
  once: 'Una sola vez',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  concurrent: 'Concurrente',
};

function formatScheduledAt(value: string) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function OnlineServicioPage() {
  const { toast } = useToast();
  const [events, setEvents] = React.useState<OnlineEvent[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<OnlineEvent | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadEvents = React.useCallback(async (q = '') => {
    setLoadState('loading');
    try {
      const url = q ? `/api/online/eventos?q=${encodeURIComponent(q)}` : '/api/online/eventos';
      const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      const json = (await res.json().catch(() => ({}))) as { events?: OnlineEvent[]; error?: string };
      if (!res.ok) throw new Error(json.error || 'Error al cargar eventos.');
      setEvents(json.events ?? []);
      setLoadState('ready');
    } catch (e) {
      setLoadState('error');
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Error al cargar.' });
    }
  }, [toast]);

  React.useEffect(() => { void loadEvents(); }, [loadEvents]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void loadEvents(searchTerm), 350);
    return () => window.clearTimeout(t);
  }, [searchTerm, loadEvents]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/online/eventos?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' });
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar.');
      toast({ title: 'Evento eliminado', description: json.message });
      setDeleteTarget(null);
      void loadEvents(searchTerm);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: e instanceof Error ? e.message : 'Inténtalo de nuevo.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Eventos Online"
        description="Reuniones virtuales: jóvenes, femenil, oración y más."
      >
        <Button asChild>
          <Link href="/online/servicio/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar evento…"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Loading */}
            {loadState === 'loading' && (
              <p className="py-8 text-center text-sm text-muted-foreground">Cargando eventos…</p>
            )}

            {/* Empty */}
            {loadState === 'ready' && events.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Wifi className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-base font-medium text-muted-foreground">Sin eventos online aún</p>
                <p className="text-sm text-muted-foreground">
                  Crea tu primer evento virtual para coordinar la asistencia de los templos.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/online/servicio/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer evento
                  </Link>
                </Button>
              </div>
            )}

            {/* Event grid */}
            {loadState === 'ready' && events.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="border-border/70">
                    <CardContent className="space-y-3 p-5">

                      {/* Name + platform */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{event.category}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {event.platform}
                        </Badge>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatScheduledAt(event.scheduledAt)}</span>
                        {event.recurrence !== 'once' && (
                          <Badge variant="outline" className="ml-auto text-[10px]">
                            {RECURRENCE_LABELS[event.recurrence]}
                          </Badge>
                        )}
                      </div>

                      {/* Weekday */}
                      {event.weekday && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span>Cada {event.weekday}</span>
                        </div>
                      )}

                      {/* Participating churches */}
                      <div className="flex items-start gap-2">
                        <Church className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          {event.participatingChurches.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {event.participatingChurches.slice(0, 3).map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-block max-w-[130px] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium"
                                  title={c.name}
                                >
                                  {c.name}
                                </span>
                              ))}
                              {event.participatingChurches.length > 3 && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                  +{event.participatingChurches.length - 3} más
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin templos asignados</span>
                          )}
                        </div>
                      </div>

                      {/* Meeting link */}
                      {event.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-xs text-primary underline-offset-2 hover:underline"
                          >
                            {event.meetingLink}
                          </a>
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
                      )}

                      {/* Footer actions */}
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{event.participatingChurches.length} templo{event.participatingChurches.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link href={`/online/servicio/${event.id}`}>Ver detalle</Link>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTarget(event)}
                            aria-label={`Eliminar ${event.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «<strong>{deleteTarget?.name}</strong>» de los eventos online. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); void handleDelete(); }}
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
