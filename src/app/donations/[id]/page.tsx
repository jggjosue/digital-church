'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type DonationDetail = {
  id: string;
  recordCategory?: string;
  donor: {
    memberId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  churchId: string;
  churchName: string;
  attendanceEvent: { id: string; name: string };
  amount: number;
  donationDate: string;
  fundCampaign: string;
  paymentMethod: string;
  transferReference?: string;
  donationFrequency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const FUND_LABELS: Record<string, string> = {
  'general-fund': 'Fondo Regional',
  'local-fund': 'Fondo Local',
  'building-fund': 'Fondo de Construcción',
  'missions-fund': 'Fondo de Misiones',
  'youth-fund': 'Fondo del Ministerio Juvenil',
  'benevolence-fund': 'Fondo de Benevolencia',
  'pastor-fund': 'Fondo Discrecional del Pastor',
  'other-fund': 'Otro Fondo',
};

const PAYMENT_LABELS: Record<string, string> = {
  'credit-card': 'Tarjeta de Crédito',
  check: 'Cheque',
  cash: 'Efectivo',
  online: 'Transferencia',
};

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Solo una vez',
  weekly: 'Semanalmente',
  biweekly: 'Quincenalmente',
  monthly: 'Mensualmente',
};

const RECORD_CATEGORY_LABELS: Record<string, string> = {
  donations: 'Donación',
  offering: 'Ofrenda',
  pledges: 'Promesa',
  campaigns: 'Campaña',
};

const formatLongDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(d);
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(140px,200px)_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default function DonationDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [donation, setDonation] = React.useState<DonationDetail | null>(null);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = React.useState<string | null>(null);
  const [canEditDonation, setCanEditDonation] = React.useState(true);

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
        setCanEditDonation(role !== 'congregante');
      } catch {
        if (!cancelled) setCanEditDonation(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!id?.trim()) {
      setLoadState('error');
      setMessage('Identificador de donación no válido.');
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      setMessage(null);
      try {
        const response = await fetch(`/api/donations/${encodeURIComponent(id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await response.json().catch(() => ({}))) as {
          donation?: DonationDetail;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error || 'No se pudo cargar la donación.');
        }
        if (cancelled) return;
        setDonation(json.donation ?? null);
        setLoadState('ready');
      } catch (e) {
        if (cancelled) return;
        setDonation(null);
        setLoadState('error');
        setMessage(e instanceof Error ? e.message : 'Error al cargar.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const donorName = donation
    ? `${donation.donor.firstName} ${donation.donor.lastName}`.trim()
    : '';

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Detalle de donación"
        description={
          donation
            ? `${donorName} · ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(donation.amount)}`
            : 'Consulta completa del registro guardado en la base de datos.'
        }
      >
        <Button variant="outline" asChild>
          <Link href="/donations">Volver al listado</Link>
        </Button>
        {donation && canEditDonation ? (
          <Button asChild>
            <Link href={`/donations/${donation.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </AppHeader>

      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">
        {loadState === 'loading' ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : null}

        {loadState === 'error' ? (
          <p className="mx-auto max-w-3xl text-center text-sm text-destructive">{message}</p>
        ) : null}

        {loadState === 'ready' && donation ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Donante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  <DetailRow label="Nombre completo" value={donorName || '—'} />
                  <DetailRow label="ID de miembro" value={donation.donor.memberId} />
                  <DetailRow
                    label="Correo"
                    value={donation.donor.email?.trim() || '—'}
                  />
                  <DetailRow
                    label="Teléfono"
                    value={donation.donor.phone?.trim() || '—'}
                  />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templo y evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  <DetailRow label="Templo" value={donation.churchName} />
                  <DetailRow label="ID del templo" value={donation.churchId} />
                  <DetailRow label="Evento" value={donation.attendanceEvent.name} />
                  <DetailRow label="ID del evento (asistencia)" value={donation.attendanceEvent.id} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Donación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  <DetailRow
                    label="Tipo de registro"
                    value={
                      RECORD_CATEGORY_LABELS[donation.recordCategory ?? 'donations'] ??
                      RECORD_CATEGORY_LABELS.donations
                    }
                  />
                  <DetailRow
                    label="Monto"
                    value={new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    }).format(donation.amount)}
                  />
                  <DetailRow
                    label="Fecha de donación"
                    value={formatLongDate(donation.donationDate)}
                  />
                  <DetailRow
                    label="Fondo / campaña"
                    value={FUND_LABELS[donation.fundCampaign] ?? donation.fundCampaign}
                  />
                  <DetailRow
                    label="Método de pago"
                    value={PAYMENT_LABELS[donation.paymentMethod] ?? donation.paymentMethod}
                  />
                  <DetailRow
                    label="Referencia de transferencia"
                    value={donation.transferReference?.trim() || '—'}
                  />
                  <DetailRow
                    label="Frecuencia"
                    value={
                      FREQUENCY_LABELS[donation.donationFrequency] ??
                      donation.donationFrequency
                    }
                  />
                  <DetailRow
                    label="Notas"
                    value={
                      donation.notes?.trim() ? (
                        <span className="whitespace-pre-wrap">{donation.notes.trim()}</span>
                      ) : (
                        '—'
                      )
                    }
                  />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registro en sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  <DetailRow label="ID del registro" value={donation.id} />
                  <DetailRow label="Creado" value={formatLongDate(donation.createdAt)} />
                  <DetailRow label="Actualizado" value={formatLongDate(donation.updatedAt)} />
                </dl>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
