'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CalendarDays,
  Church,
  ExternalLink,
  Link2,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';

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
  updatedAt: string;
};

const RECURRENCE_LABELS: Record<string, string> = {
  once: 'Una sola vez',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  concurrent: 'Concurrente',
};

function formatDate(value: string) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function OnlineEventoDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [event, setEvent] = React.useState<OnlineEvent | null>(null);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      setLoadState('loading');
      try {
        const res = await fetch(`/api/online/eventos?id=${encodeURIComponent(id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json().catch(() => ({}))) as { events?: OnlineEvent[]; error?: string };
        if (!res.ok) throw new Error(json.error || 'Error al cargar.');
        if (cancelled) return;
        const found = (json.events ?? []).find((e) => e.id === id) ?? null;
        setEvent(found);
        setLoadState('ready');
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Error al cargar.');
          setLoadState('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title={event?.name ?? 'Detalle de Evento'}
        description={event ? `${event.category} · ${event.platform}` : 'Evento online'}
      >
        <Button variant="outline" asChild>
          <Link href="/online/servicio">← Volver</Link>
        </Button>
      </AppHeader>

      <main className="flex-1 space-y-5 bg-muted/20 p-4 sm:p-8">

        {/* Loading */}
        {loadState === 'loading' && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border bg-muted/40" />
            ))}
          </div>
        )}

        {/* Error */}
        {loadState === 'error' && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-destructive">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Not found */}
        {loadState === 'ready' && !event && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Evento no encontrado.
            </CardContent>
          </Card>
        )}

        {/* Event detail */}
        {loadState === 'ready' && event && (
          <>
            {/* Main info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{event.platform}</Badge>
                  <Badge variant="outline">{RECURRENCE_LABELS[event.recurrence]}</Badge>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
                <CardTitle className="text-2xl">{event.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Date */}
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(event.scheduledAt)}</p>
                    {/* Multiple weekdays */}
                    {(event.weekdays?.length > 0 || event.weekday) && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(event.weekdays?.length > 0 ? event.weekdays : [event.weekday]).map((d) => (
                          <span key={d} className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meeting link */}
                {event.meetingLink && (
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                    >
                      {event.meetingLink}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Description */}
                {event.description && (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}

                {/* Notes */}
                {event.notes && (
                  <div className="rounded-lg border border-dashed p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Notas internas</p>
                    <p className="mt-1 text-sm">{event.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participating churches */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Church className="h-4 w-4 text-muted-foreground" />
                    Templos participantes
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {event.participatingChurches.length} templo{event.participatingChurches.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {event.participatingChurches.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No hay templos asignados a este evento.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {event.participatingChurches.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5"
                      >
                        <Church className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="truncate text-sm font-medium">{c.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
