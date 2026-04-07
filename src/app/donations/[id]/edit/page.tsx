'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ChurchItem = {
  id: string;
  name: string;
};

type ChurchAttendanceEventItem = {
  id: string;
  eventName: string;
  eventType: 'service' | 'event';
  createdAt: string;
};

type MemberItem = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

type RecordCategory = 'donations' | 'offering' | 'pledges' | 'campaigns';

function normalizeRecordCategory(value: string | undefined): RecordCategory {
  if (
    value === 'pledges' ||
    value === 'campaigns' ||
    value === 'donations' ||
    value === 'offering'
  ) {
    return value;
  }
  return 'donations';
}

type DonationApi = {
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

export default function EditDonationPage() {
  const params = useParams();
  const donationId =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { toast } = useToast();
  const router = useRouter();

  const [pageLoadState, setPageLoadState] = React.useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [loadErrorMessage, setLoadErrorMessage] = React.useState<string | null>(null);

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [churches, setChurches] = React.useState<ChurchItem[]>([]);
  const [selectedChurchId, setSelectedChurchId] = React.useState('');
  const [churchesState, setChurchesState] = React.useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [churchEvents, setChurchEvents] = React.useState<ChurchAttendanceEventItem[]>([]);
  const [selectedChurchEventId, setSelectedChurchEventId] = React.useState('');
  const [churchEventsState, setChurchEventsState] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [donorSearch, setDonorSearch] = React.useState('');
  const [memberResults, setMemberResults] = React.useState<MemberItem[]>([]);
  const [memberSearchState, setMemberSearchState] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [selectedDonor, setSelectedDonor] = React.useState<MemberItem | null>(null);
  const [isMemberListOpen, setIsMemberListOpen] = React.useState(false);
  const suppressMemberSearchRef = React.useRef(false);
  const lastFetchedEventsForChurchRef = React.useRef<string | null>(null);

  const [paymentMethod, setPaymentMethod] = React.useState('credit-card');
  const [transferNumber, setTransferNumber] = React.useState('');
  const [donationFrequency, setDonationFrequency] = React.useState('once');
  const [amount, setAmount] = React.useState('');
  const [fundCampaign, setFundCampaign] = React.useState('general-fund');
  const [recordCategory, setRecordCategory] = React.useState<RecordCategory>('donations');
  const [notes, setNotes] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!donationId?.trim()) {
      setPageLoadState('error');
      setLoadErrorMessage('Identificador de donación no válido.');
      setChurchesState('error');
      return;
    }

    let cancelled = false;
    (async () => {
      setPageLoadState('loading');
      setLoadErrorMessage(null);
      setChurchesState('loading');
      try {
        const [dRes, cRes] = await Promise.all([
          fetch(`/api/donations/${encodeURIComponent(donationId)}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          }),
          fetch('/api/churches', {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          }),
        ]);
        const dJson = (await dRes.json().catch(() => ({}))) as {
          donation?: DonationApi;
          error?: string;
        };
        const cJson = (await cRes.json().catch(() => ({}))) as { churches?: ChurchItem[] };
        if (!dRes.ok) throw new Error(dJson.error || 'No se pudo cargar la donación.');
        if (!cRes.ok) throw new Error('No se pudieron cargar los templos.');
        if (cancelled) return;
        const donation = dJson.donation;
        if (!donation) throw new Error('Donación no encontrada.');

        const nextChurches = (cJson.churches ?? []).sort((a, b) =>
          a.name.localeCompare(b.name, 'es')
        );
        setChurches(nextChurches);
        setChurchesState('ready');

        setSelectedDonor({
          id: donation.donor.memberId,
          firstName: donation.donor.firstName,
          lastName: donation.donor.lastName,
          email: donation.donor.email ?? '',
          phone: donation.donor.phone ?? '',
        });
        setDonorSearch(`${donation.donor.firstName} ${donation.donor.lastName}`.trim());
        setSelectedChurchId(donation.churchId);
        setAmount(String(donation.amount));
        setDate(new Date(donation.donationDate));
        setFundCampaign(donation.fundCampaign);
        setRecordCategory(normalizeRecordCategory(donation.recordCategory));
        setPaymentMethod(donation.paymentMethod);
        setTransferNumber((donation.transferReference ?? '').trim());
        setDonationFrequency(donation.donationFrequency);
        setNotes(donation.notes ?? '');

        const eRes = await fetch(
          `/api/churches/${encodeURIComponent(donation.churchId)}/attendance`,
          {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          }
        );
        const eJson = (await eRes.json().catch(() => ({}))) as {
          records?: ChurchAttendanceEventItem[];
          error?: string;
        };
        if (!eRes.ok) throw new Error(eJson.error || 'No se pudieron cargar los eventos del templo.');
        if (cancelled) return;

        const seenNames = new Set<string>();
        let uniqueByName = (eJson.records ?? []).filter((record) => {
          const normalizedName = record.eventName.trim().toLowerCase();
          if (!normalizedName || seenNames.has(normalizedName)) return false;
          seenNames.add(normalizedName);
          return true;
        });

        const ev = donation.attendanceEvent;
        if (!uniqueByName.some((e) => e.id === ev.id)) {
          uniqueByName = [
            {
              id: ev.id,
              eventName: ev.name,
              eventType: 'event',
              createdAt: donation.createdAt,
            },
            ...uniqueByName,
          ];
        }
        setChurchEvents(uniqueByName);
        setSelectedChurchEventId(ev.id);
        setChurchEventsState('ready');
        lastFetchedEventsForChurchRef.current = donation.churchId;
        setPageLoadState('ready');
      } catch (e) {
        if (!cancelled) {
          setPageLoadState('error');
          setLoadErrorMessage(e instanceof Error ? e.message : 'Error al cargar.');
          setChurchesState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [donationId]);

  React.useEffect(() => {
    if (suppressMemberSearchRef.current) {
      suppressMemberSearchRef.current = false;
      setMemberResults([]);
      setMemberSearchState('idle');
      return;
    }

    const q = donorSearch.trim();
    if (q.length < 2) {
      setMemberResults([]);
      setMemberSearchState('idle');
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setMemberSearchState('loading');
      try {
        const response = await fetch(`/api/members?q=${encodeURIComponent(q)}&limit=8`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await response.json().catch(() => ({}))) as { members?: MemberItem[] };
        if (!response.ok) {
          throw new Error('No se pudieron cargar los miembros.');
        }
        if (cancelled) return;
        setMemberResults(json.members ?? []);
        setMemberSearchState('ready');
        setIsMemberListOpen(true);
      } catch (_error) {
        if (cancelled) return;
        setMemberResults([]);
        setMemberSearchState('error');
        setIsMemberListOpen(true);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [donorSearch]);

  React.useEffect(() => {
    if (pageLoadState !== 'ready') return;
    if (!selectedChurchId) {
      setChurchEvents([]);
      setSelectedChurchEventId('');
      setChurchEventsState('idle');
      lastFetchedEventsForChurchRef.current = null;
      return;
    }
    if (lastFetchedEventsForChurchRef.current === selectedChurchId) {
      return;
    }

    let cancelled = false;
    const loadChurchEvents = async () => {
      setChurchEventsState('loading');
      setSelectedChurchEventId('');
      try {
        const response = await fetch(`/api/churches/${encodeURIComponent(selectedChurchId)}/attendance`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await response.json().catch(() => ({}))) as {
          records?: ChurchAttendanceEventItem[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error || 'No se pudieron cargar los eventos del templo.');
        }
        if (cancelled) return;

        const seenNames = new Set<string>();
        const uniqueByName = (json.records ?? []).filter((record) => {
          const normalizedName = record.eventName.trim().toLowerCase();
          if (!normalizedName || seenNames.has(normalizedName)) return false;
          seenNames.add(normalizedName);
          return true;
        });

        setChurchEvents(uniqueByName);
        setChurchEventsState('ready');
        lastFetchedEventsForChurchRef.current = selectedChurchId;
      } catch (_error) {
        if (cancelled) return;
        setChurchEvents([]);
        setChurchEventsState('error');
      }
    };

    void loadChurchEvents();
    return () => {
      cancelled = true;
    };
  }, [selectedChurchId, pageLoadState]);

  const handleSelectMember = (member: MemberItem) => {
    suppressMemberSearchRef.current = true;
    const fullName = `${member.firstName} ${member.lastName}`.trim();
    setSelectedDonor(member);
    setDonorSearch(fullName);
    setMemberResults([]);
    setMemberSearchState('idle');
    setIsMemberListOpen(false);
    if (fieldErrors.donor) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.donor;
        return next;
      });
    }
  };

  const handleClearDonor = () => {
    setSelectedDonor(null);
    setDonorSearch('');
    setMemberResults([]);
    setMemberSearchState('idle');
    setIsMemberListOpen(false);
  };

  const parseAmount = (raw: string): number => {
    const normalized = raw.trim().replace(',', '.');
    return Number.parseFloat(normalized);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedDonor) {
      errors.donor = 'Seleccione un donante de los resultados de búsqueda.';
    }

    if (churchesState !== 'ready' || !selectedChurchId.trim()) {
      errors.church =
        churchesState === 'error'
          ? 'No se pudieron cargar los templos. Actualice la página.'
          : 'Seleccione un templo.';
    }

    if (selectedChurchId.trim() && churchesState === 'ready') {
      if (churchEventsState === 'error') {
        errors.event =
          'No se pudieron cargar los eventos. Intente de nuevo o compruebe la conexión.';
      } else if (churchEventsState === 'loading' || churchEventsState === 'idle') {
        errors.event = 'Espere a que se carguen los eventos del templo.';
      } else if (churchEventsState === 'ready') {
        if (churchEvents.length === 0) {
          errors.event = 'Este templo no tiene eventos registrados en asistencia.';
        } else if (!selectedChurchEventId) {
          errors.event = 'Seleccione el evento del templo.';
        }
      }
    }

    const amountValue = parseAmount(amount);
    if (!amount.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
      errors.amount = 'Ingrese un monto válido mayor que 0.';
    }

    if (!date) {
      errors.date = 'Seleccione la fecha de la donación.';
    }

    if (!fundCampaign.trim()) {
      errors.fund = 'Seleccione un fondo o campaña.';
    }

    if (!paymentMethod.trim()) {
      errors.payment = 'Seleccione un método de pago.';
    }

    if (paymentMethod === 'online' && !transferNumber.trim()) {
      errors.transfer = 'Ingrese el número o referencia de la transferencia.';
    }

    if (!donationFrequency.trim()) {
      errors.frequency = 'Seleccione la frecuencia.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Formulario incompleto',
        description: 'Revise los campos obligatorios (las notas son opcionales).',
      });
      return false;
    }

    return true;
  };

  const handleSaveDonation = async () => {
    if (!donationId?.trim()) return;
    if (!validateForm()) return;

    const church = churches.find((c) => c.id === selectedChurchId);
    const selectedEvent = churchEvents.find((e) => e.id === selectedChurchEventId);
    if (!selectedDonor || !church || !selectedEvent || !date) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: 'Faltan datos del formulario. Revise templo, evento y donante.',
      });
      return;
    }

    const amountValue = parseAmount(amount);
    const body = {
      recordCategory,
      donor: {
        memberId: selectedDonor.id,
        firstName: selectedDonor.firstName,
        lastName: selectedDonor.lastName,
        email: selectedDonor.email ?? '',
        phone: selectedDonor.phone ?? '',
      },
      churchId: selectedChurchId,
      churchName: church.name,
      attendanceEvent: {
        id: selectedChurchEventId,
        name: selectedEvent.eventName,
      },
      amount: amountValue,
      donationDate: date.toISOString(),
      fundCampaign,
      paymentMethod,
      transferReference: paymentMethod === 'online' ? transferNumber.trim() : '',
      donationFrequency,
      notes: notes.trim(),
    };

    setSaving(true);
    try {
      const response = await fetch(`/api/donations/${encodeURIComponent(donationId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(json.error || 'No se pudo actualizar la donación.');
      }
      toast({
        title: 'Donación actualizada',
        description: json.message || 'Los cambios se guardaron en la base de datos.',
      });
      router.push('/donations');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: e instanceof Error ? e.message : 'Inténtelo de nuevo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const formDisabled = pageLoadState !== 'ready' || saving;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title={
          <>
            Editar donación{' '}
            <span className="font-mono text-sm text-muted-foreground">
              {donationId ? `#${donationId.slice(0, 8)}…` : '—'}
            </span>
          </>
        }
        description="Datos cargados desde la base de datos. Modifique y guarde los cambios."
      >
        <Button variant="ghost" asChild>
          <Link href={donationId ? `/donations/${donationId}` : '/donations'}>Cancelar</Link>
        </Button>
        <Button type="button" onClick={() => void handleSaveDonation()} disabled={formDisabled}>
          {saving ? 'Editando…' : 'Editar Cambios'}
        </Button>
      </AppHeader>
      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">
        {pageLoadState === 'loading' ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : null}
        {pageLoadState === 'error' ? (
          <p className="mx-auto max-w-3xl text-center text-sm text-destructive">
            {loadErrorMessage}
          </p>
        ) : null}

        {pageLoadState === 'ready' ? (
          <Card
            className={cn('mx-auto max-w-3xl', saving && 'pointer-events-none opacity-70')}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="record-category">Tipo de registro</Label>
                  <Select
                    value={recordCategory}
                    onValueChange={(v) => setRecordCategory(v as RecordCategory)}
                    disabled={formDisabled}
                  >
                    <SelectTrigger id="record-category">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donations">Donación</SelectItem>
                      <SelectItem value="offering">Ofrenda</SelectItem>
                      <SelectItem value="pledges">Promesa</SelectItem>
                      <SelectItem value="campaigns">Campaña</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Clasifique si este movimiento es donación, promesa o campaña.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor-search">Donante</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="donor-search"
                      placeholder="Buscar un donante existente..."
                      className="pl-9"
                      value={donorSearch}
                      disabled={saving}
                      onChange={(e) => {
                        setDonorSearch(e.target.value);
                        setSelectedDonor(null);
                        setIsMemberListOpen(true);
                      }}
                      onFocus={() => {
                        if (memberResults.length > 0 || memberSearchState !== 'idle') {
                          setIsMemberListOpen(true);
                        }
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setIsMemberListOpen(false), 200);
                      }}
                    />
                  </div>
                  {isMemberListOpen && !selectedDonor && donorSearch.trim().length >= 2 ? (
                    <div className="rounded-md border bg-background shadow-sm" role="listbox">
                      {memberSearchState === 'loading' ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando miembros...</p>
                      ) : null}
                      {memberSearchState === 'error' ? (
                        <p className="px-3 py-2 text-sm text-destructive">Error al buscar miembros.</p>
                      ) : null}
                      {memberSearchState === 'ready' && memberResults.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No se encontraron miembros.
                        </p>
                      ) : null}
                      {memberResults.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          role="option"
                          className="flex w-full items-start justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSelectMember(member);
                          }}
                        >
                          <span className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.email || member.phone || ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {selectedDonor ? (
                    <div
                      className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                        Donante en el formulario
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {selectedDonor.firstName} {selectedDonor.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedDonor.email || selectedDonor.phone || 'Sin contacto'}
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={handleClearDonor}
                        disabled={saving}
                      >
                        Cambiar donante
                      </Button>
                    </div>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    ¿No encuentra al donante?{' '}
                    <Link href="/members/new" className="text-primary underline">
                      Añada un nuevo perfil de donante
                    </Link>
                    .
                  </p>
                  {fieldErrors.donor ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldErrors.donor}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="church">Templo</Label>
                  <Select
                    value={selectedChurchId}
                    onValueChange={(v) => {
                      lastFetchedEventsForChurchRef.current = null;
                      setSelectedChurchId(v);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.church;
                        delete next.event;
                        return next;
                      });
                    }}
                    disabled={churchesState !== 'ready' || churches.length === 0 || saving}
                  >
                    <SelectTrigger id="church">
                      <SelectValue
                        placeholder={
                          churchesState === 'loading'
                            ? 'Cargando templos...'
                            : churchesState === 'error'
                              ? 'Error al cargar templos'
                              : 'Selecciona un templo'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.church ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldErrors.church}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church-event">Evento del templo</Label>
                  <Select
                    value={selectedChurchEventId}
                    onValueChange={(v) => {
                      setSelectedChurchEventId(v);
                      if (fieldErrors.event) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.event;
                          return next;
                        });
                      }
                    }}
                    disabled={!selectedChurchId || churchEventsState === 'loading' || saving}
                  >
                    <SelectTrigger id="church-event">
                      <SelectValue
                        placeholder={
                          !selectedChurchId
                            ? 'Selecciona primero un templo'
                            : churchEventsState === 'loading'
                              ? 'Cargando eventos...'
                              : churchEventsState === 'error'
                                ? 'Error al cargar eventos'
                                : churchEvents.length === 0
                                  ? 'Este templo no tiene eventos'
                                  : 'Selecciona un evento'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {churchEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.eventName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.event ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldErrors.event}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        value={amount}
                        disabled={saving}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          if (fieldErrors.amount) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.amount;
                              return next;
                            });
                          }
                        }}
                      />
                    </div>
                    {fieldErrors.amount ? (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.amount}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donation-date">Fecha de Donación</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                          disabled={saving}
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'MM/dd/yyyy') : <span>mm/dd/yyyy</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d);
                            if (fieldErrors.date && d) {
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                delete next.date;
                                return next;
                              });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldErrors.date ? (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.date}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fund-campaign">Fondo / Campaña</Label>
                    <Select
                      value={fundCampaign}
                      onValueChange={(v) => {
                        setFundCampaign(v);
                        if (fieldErrors.fund) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.fund;
                            return next;
                          });
                        }
                      }}
                      disabled={saving}
                    >
                      <SelectTrigger id="fund-campaign">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general-fund">Fondo Regional</SelectItem>
                        <SelectItem value="local-fund">Fondo Local</SelectItem>
                        <SelectItem value="building-fund">Fondo de Construcción</SelectItem>
                        <SelectItem value="missions-fund">Fondo de Misiones</SelectItem>
                        <SelectItem value="youth-fund">Fondo del Ministerio Juvenil</SelectItem>
                        <SelectItem value="benevolence-fund">Fondo de Benevolencia</SelectItem>
                        <SelectItem value="pastor-fund">Fondo Discrecional del Pastor</SelectItem>
                        <SelectItem value="other-fund">Otro Fondo</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.fund ? (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.fund}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => {
                        setPaymentMethod(value);
                        if (value !== 'online') {
                          setTransferNumber('');
                        }
                        if (fieldErrors.payment || fieldErrors.transfer) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.payment;
                            delete next.transfer;
                            return next;
                          });
                        }
                      }}
                      disabled={saving}
                    >
                      <SelectTrigger id="payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="online">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.payment ? (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.payment}
                      </p>
                    ) : null}
                  </div>
                </div>

                {paymentMethod === 'online' ? (
                  <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm text-foreground">
                      Por favor escribe abajo el <strong>número de transferencia</strong> o la referencia
                      bancaria de tu depósito para poder conciliar el pago.
                    </p>
                    <Label htmlFor="transfer-number">Número de transferencia</Label>
                    <Input
                      id="transfer-number"
                      value={transferNumber}
                      disabled={saving}
                      onChange={(e) => {
                        setTransferNumber(e.target.value);
                        if (fieldErrors.transfer) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.transfer;
                            return next;
                          });
                        }
                      }}
                      placeholder="Referencia o número de operación"
                      autoComplete="off"
                    />
                    {fieldErrors.transfer ? (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldErrors.transfer}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="donation-frequency">Frecuencia de la donación</Label>
                  <Select
                    value={donationFrequency}
                    onValueChange={(v) => {
                      setDonationFrequency(v);
                      if (fieldErrors.frequency) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.frequency;
                          return next;
                        });
                      }
                    }}
                    disabled={saving}
                  >
                    <SelectTrigger id="donation-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Solo una vez</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="biweekly">Quincenalmente</SelectItem>
                      <SelectItem value="monthly">Mensualmente</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Selecciona cada cuánto se registrará este donativo.
                  </p>
                  {fieldErrors.frequency ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldErrors.frequency}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notas <span className="font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Añada cualquier nota relevante…"
                    rows={3}
                    value={notes}
                    disabled={saving}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
