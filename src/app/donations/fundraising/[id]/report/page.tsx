'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  FileBarChart,
  Hash,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { FundraisingCampaignDoc, FundraisingStatus } from '@/lib/fundraising-seed';

const statusColors: Record<FundraisingStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-blue-100 text-blue-800 border-blue-200',
  Upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

const progressIndicator: Record<FundraisingStatus, string> = {
  Active: 'bg-blue-500',
  Completed: 'bg-green-500',
  Upcoming: 'bg-gray-400',
  Draft: 'bg-muted-foreground',
};

function statusLabel(s: FundraisingStatus) {
  if (s === 'Active') return 'Activo';
  if (s === 'Completed') return 'Completado';
  if (s === 'Upcoming') return 'Próximo';
  return 'Borrador';
}

function datePrefix(status: FundraisingStatus) {
  if (status === 'Completed') return 'Finalizó';
  if (status === 'Upcoming') return 'Comienza';
  return 'Termina';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FundraisingCampaignReportPage() {
  const params = useParams();
  const campaignId =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [campaign, setCampaign] = React.useState<FundraisingCampaignDoc | null>(null);
  const [canEditCampaign, setCanEditCampaign] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/members/me-role', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as { staffRole?: string | null };
        if (cancelled) return;
        const role = String(data.staffRole ?? '').trim().toLowerCase();
        setCanEditCampaign(role !== 'congregante');
      } catch {
        if (!cancelled) setCanEditCampaign(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!campaignId) {
      setLoadState('error');
      setLoadError('Id de campaña no válido.');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      setLoadError(null);
      try {
        const res = await fetch(`/api/fundraising/${encodeURIComponent(campaignId)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json().catch(() => ({}))) as {
          campaign?: FundraisingCampaignDoc;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error || 'No se pudo cargar la campaña.');
        }
        const c = json.campaign;
        if (!c || cancelled) return;
        setCampaign(c);
        setLoadState('ready');
      } catch (e) {
        if (cancelled) return;
        setCampaign(null);
        setLoadState('error');
        setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const listHref = '/donations/fundraising';
  const showProgress =
    campaign != null &&
    campaign.status !== 'Draft' &&
    campaign.goal != null &&
    campaign.goal > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader
        title="Informe de campaña"
        description="Resumen de la campaña según los datos en la base de datos."
      >
        <Button variant="outline" type="button" asChild>
          <Link href={listHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        {loadState === 'error' ? (
          <p className="text-center text-sm text-destructive">{loadError}</p>
        ) : null}

        {loadState === 'loading' ? (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {loadState === 'ready' && campaign ? (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileBarChart className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl leading-tight">{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={cn('shrink-0', statusColors[campaign.status])}>
                  {statusLabel(campaign.status)}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Datos obtenidos de la colección <span className="font-medium text-foreground">fundraising</span>{' '}
                  en la base configurada para la aplicación (p. ej. digital-church).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cifras de recaudación</CardTitle>
                <CardDescription>Montos y avance registrados para esta campaña.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {showProgress ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex gap-3 rounded-lg border bg-card p-4">
                        <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total recaudado</p>
                          <p className="text-2xl font-bold tabular-nums">
                            {formatCurrency(campaign.raised)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-lg border bg-card p-4">
                        <Target className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Meta</p>
                          <p className="text-2xl font-bold tabular-nums">
                            {formatCurrency(campaign.goal!)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avance</span>
                        <span
                          className={cn(
                            'font-medium',
                            campaign.progress > 100 ? 'text-green-600' : 'text-foreground'
                          )}
                        >
                          {campaign.progress}%
                          {campaign.progress > 100 ? ' — Meta superada' : ''}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, campaign.progress)}
                        className="h-2"
                        indicatorClassName={progressIndicator[campaign.status]}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {campaign.status === 'Draft'
                      ? 'Campaña en borrador: aún no hay meta publicada para mostrar el avance.'
                      : 'No hay meta definida para calcular el porcentaje de recaudación.'}
                  </p>
                )}

                <Separator />

                <div className="flex flex-wrap gap-6 text-sm">
                  {campaign.date ? (
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Fecha</p>
                        <p className="font-medium">
                          {datePrefix(campaign.status)} {campaign.date}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2">
                    <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Identificador</p>
                      <p className="font-mono text-xs font-medium">{campaign.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              {canEditCampaign ? (
                <Button variant="outline" asChild>
                  <Link href={`/donations/fundraising/${campaign.id}/edit`}>Editar campaña</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
