'use client';

import * as React from 'react';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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

function parseCampaignDateLabel(value: string): Date | undefined {
  const s = value.trim();
  if (!s) return undefined;
  const candidates = [
    parse(s, "d 'de' MMM, yyyy", new Date()),
    parse(s, "d 'de' MMM, yyyy", new Date(), { locale: es }),
    parse(s, "dd/MM/yyyy", new Date()),
  ];
  for (const d of candidates) {
    if (isValid(d)) return d;
  }
  return undefined;
}

export default function EditFundraisingCampaignPage() {
  const params = useParams();
  const campaignId =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const router = useRouter();
  const { toast } = useToast();

  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<FundraisingStatus>('Active');
  const [raised, setRaised] = React.useState('');
  const [goal, setGoal] = React.useState('');
  const [dateLabel, setDateLabel] = React.useState('');
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

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
        setName(c.name);
        setDescription(c.description);
        setStatus(c.status);
        setRaised(String(c.raised));
        setGoal(c.goal != null ? String(c.goal) : '');
        setDateLabel(c.date);
        setEndDate(parseCampaignDateLabel(c.date));
        setLoadState('ready');
      } catch (e) {
        if (cancelled) return;
        setLoadState('error');
        setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const raisedNum = Number(raised.replace(/,/g, ''));
  const goalNum = goal.trim() === '' ? null : Number(goal.replace(/,/g, ''));

  const previewProgress =
    goalNum != null && Number.isFinite(goalNum) && goalNum > 0 && Number.isFinite(raisedNum) && raisedNum >= 0
      ? Math.round((raisedNum / goalNum) * 100)
      : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const onPickDate = (d: Date | undefined) => {
    setEndDate(d);
    if (d) {
      setDateLabel(format(d, "d 'de' LLL, yyyy", { locale: es }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    const raisedParsed = Number(raised.replace(/,/g, ''));
    const goalParsed = goal.trim() === '' ? null : Number(goal.replace(/,/g, ''));

    if (!name.trim()) {
      toast({ title: 'Revise el formulario', description: 'El título es obligatorio.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(raisedParsed) || raisedParsed < 0) {
      toast({
        title: 'Revise el formulario',
        description: 'El monto recaudado no es válido.',
        variant: 'destructive',
      });
      return;
    }
    if (goalParsed !== null && (!Number.isFinite(goalParsed) || goalParsed < 0)) {
      toast({ title: 'Revise el formulario', description: 'La meta no es válida.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/fundraising/${encodeURIComponent(campaignId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status,
          raised: raisedParsed,
          goal: goalParsed,
          date: dateLabel.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        campaign?: FundraisingCampaignDoc;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || 'No se pudieron guardar los cambios.');
      }
      toast({ title: 'Cambios guardados', description: 'La campaña se actualizó correctamente.' });
      router.push('/donations/fundraising');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const listHref = '/donations/fundraising';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader
        title="Editar campaña"
        description="Actualice título, descripción, estado, montos y fecha de la campaña."
      >
        <Button variant="outline" type="button" asChild>
          <Link href={listHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        {loadState === 'error' ? (
          <p className="text-center text-sm text-destructive">{loadError}</p>
        ) : null}

        {loadState === 'loading' ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : null}

        {loadState === 'ready' ? (
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>Vista previa</CardTitle>
                  <CardDescription>Así se verá el resumen en la tarjeta de la lista.</CardDescription>
                </div>
                <Badge variant="outline" className={cn('shrink-0', statusColors[status])}>
                  {statusLabel(status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{name || 'Sin título'}</p>
                  <p className="text-sm text-muted-foreground">{description || 'Sin descripción'}</p>
                </div>
                {status !== 'Draft' && goalNum != null && goalNum > 0 ? (
                  <>
                    <div className="flex items-end justify-between gap-2">
                      <span className="text-xl font-bold">
                        {Number.isFinite(raisedNum) ? formatCurrency(raisedNum) : '—'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {formatCurrency(goalNum)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, previewProgress)}
                      className="h-2"
                      indicatorClassName={progressIndicator[status]}
                    />
                    <p className="text-sm font-medium">{previewProgress}% Recaudado</p>
                  </>
                ) : null}
                {dateLabel.trim() ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span>Termina {dateLabel}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos de la campaña</CardTitle>
                <CardDescription>Los cambios se guardan en la base de datos al pulsar Guardar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Título de la campaña</Label>
                  <Input
                    id="campaign-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Fondo para la construcción…"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-description">Descripción</Label>
                  <Textarea
                    id="campaign-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Breve descripción para donantes y equipo."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as FundraisingStatus)}
                  >
                    <SelectTrigger className="w-full sm:max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Activo</SelectItem>
                      <SelectItem value="Upcoming">Próximo</SelectItem>
                      <SelectItem value="Completed">Completado</SelectItem>
                      <SelectItem value="Draft">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-raised">Monto recaudado (MXN)</Label>
                    <Input
                      id="campaign-raised"
                      inputMode="decimal"
                      value={raised}
                      onChange={(e) => setRaised(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Puede ajustarlo manualmente; el porcentaje se recalcula con la meta.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-goal">Meta (MXN)</Label>
                    <Input
                      id="campaign-goal"
                      inputMode="decimal"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de término</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start sm:w-auto">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP', { locale: es }) : 'Elegir en calendario'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={onPickDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      className="sm:flex-1"
                      value={dateLabel}
                      onChange={(e) => setDateLabel(e.target.value)}
                      placeholder="Ej. 31 de oct, 2024"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El calendario rellena el texto en español; también puede editarlo a mano.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {saving ? (
                <Button type="button" variant="outline" disabled>
                  Cancelar
                </Button>
              ) : (
                <Button type="button" variant="outline" asChild>
                  <Link href={listHref}>Cancelar</Link>
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
