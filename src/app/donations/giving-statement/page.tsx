
'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type AutoTableDoc = jsPDF & {
  autoTable: (options: {
    head: string[][];
    body: Array<Array<string | number>>;
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: Record<string, unknown>;
    styles?: Record<string, unknown>;
    columnStyles?: Record<number, Record<string, unknown>>;
  }) => void;
  lastAutoTable?: { finalY: number };
};

const STATEMENT_YEAR_MIN = 2020;
const STATEMENT_YEAR_MAX = 2030;
const STATEMENT_YEARS = Array.from(
  { length: STATEMENT_YEAR_MAX - STATEMENT_YEAR_MIN + 1 },
  (_, i) => STATEMENT_YEAR_MIN + i
);

type DonorSuggestion = {
  memberId: string;
  firstName: string;
  lastName: string;
};

function donorDisplayName(d: Pick<DonorSuggestion, 'firstName' | 'lastName'>) {
  return `${d.firstName} ${d.lastName}`.trim() || '—';
}

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

type StatementDonation = {
  id: string;
  donor: {
    memberId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  churchName: string;
  amount: number;
  donationDate: string;
  fundCampaign: string;
  paymentMethod: string;
  attendanceEvent?: { id: string; name: string };
};

const formatRowDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

function buildGivingStatementPdf(params: {
  selectedDonor: DonorSuggestion;
  statementRows: StatementDonation[];
  statementTotal: number;
  previewYear: number;
}): { doc: AutoTableDoc; filename: string } {
  const { selectedDonor, statementRows, statementTotal, previewYear } = params;

  const fl = (key: string) => FUND_LABELS[key] ?? key;
  const pl = (key: string) => PAYMENT_LABELS[key] ?? key;
  const donorFromData = statementRows[0]?.donor;

  const tableRows = statementRows.map((d) => [
    formatRowDate(d.donationDate),
    formatMoney(d.amount),
    fl(d.fundCampaign),
    pl(d.paymentMethod),
    d.churchName,
    d.attendanceEvent?.name ?? '—',
    d.id,
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }) as AutoTableDoc;
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(15);
  doc.setTextColor(30, 30, 30);
  doc.text('Declaración de donación / Estado de cuenta', 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  let lineY = 24;
  doc.text(`Donante: ${donorDisplayName(selectedDonor)}`, 14, lineY);
  lineY += 5;
  doc.text(`ID miembro: ${selectedDonor.memberId}`, 14, lineY);
  lineY += 5;
  if (donorFromData?.email?.trim()) {
    doc.text(`Correo: ${donorFromData.email.trim()}`, 14, lineY);
    lineY += 5;
  }
  if (donorFromData?.phone?.trim()) {
    doc.text(`Teléfono: ${donorFromData.phone.trim()}`, 14, lineY);
    lineY += 5;
  }
  doc.text(`Período: 1 de enero – 31 de diciembre de ${previewYear}`, 14, lineY);
  lineY += 5;
  doc.text(
    `Generado: ${new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date())}`,
    14,
    lineY
  );
  doc.setTextColor(0, 0, 0);

  doc.autoTable({
    startY: lineY + 6,
    head: [
      [
        'Fecha',
        'Monto',
        'Fondo / campaña',
        'Método de pago',
        'Templo',
        'Evento',
        'ID registro',
      ],
    ],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 120], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 28 },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 40 },
      5: { cellWidth: 38 },
      6: { cellWidth: 52 },
    },
  });

  const afterTable = doc.lastAutoTable?.finalY ?? lineY + 40;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Contribuciones totales para ${previewYear}:`, 14, afterTable + 12);
  doc.text(formatMoney(statementTotal), pageW - 14, afterTable + 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  const slug = donorDisplayName(selectedDonor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48);

  const filename = `estado-cuenta-${previewYear}-${slug || 'donante'}.pdf`;
  return { doc, filename };
}

export default function GivingStatementPage() {
  const { toast } = useToast();
  const defaultYear = new Date().getFullYear();
  const initialYear =
    defaultYear >= STATEMENT_YEAR_MIN && defaultYear <= STATEMENT_YEAR_MAX
      ? defaultYear
      : STATEMENT_YEAR_MAX;

  const [selectedYear, setSelectedYear] = React.useState(String(initialYear));
  const [donorInput, setDonorInput] = React.useState('');
  const [selectedDonor, setSelectedDonor] = React.useState<DonorSuggestion | null>(null);
  const [lockedDonor, setLockedDonor] = React.useState<DonorSuggestion | null>(null);
  const [donorSuggestions, setDonorSuggestions] = React.useState<DonorSuggestion[]>([]);
  const [donorSearchState, setDonorSearchState] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [donorListOpen, setDonorListOpen] = React.useState(false);
  const suppressDonorSearchRef = React.useRef(false);

  const [statementRows, setStatementRows] = React.useState<StatementDonation[]>([]);
  const [statementTotal, setStatementTotal] = React.useState(0);
  const [statementState, setStatementState] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [statementError, setStatementError] = React.useState<string | null>(null);
  const [statementPageIndex, setStatementPageIndex] = React.useState(0);
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState('');
  const [sendingEmail, setSendingEmail] = React.useState(false);

  const yearNum = Number.parseInt(selectedYear, 10);
  const previewYear = Number.isNaN(yearNum) ? initialYear : yearNum;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/members/me', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          member?: {
            id?: string;
            firstName?: string;
            lastName?: string;
            staffRole?: string | null;
          } | null;
        };
        if (!res.ok || cancelled) return;
        const m = data.member;
        if (!m?.id) return;
        const role = String(m.staffRole ?? '').trim().toLowerCase();
        if (role !== 'congregante') return;
        const donor: DonorSuggestion = {
          memberId: String(m.id),
          firstName: String(m.firstName ?? '').trim(),
          lastName: String(m.lastName ?? '').trim(),
        };
        suppressDonorSearchRef.current = true;
        setLockedDonor(donor);
        setSelectedDonor(donor);
        setDonorInput(donorDisplayName(donor));
        setDonorSuggestions([]);
        setDonorSearchState('idle');
        setDonorListOpen(false);
      } catch {
        // sin bloqueo si falla
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    setStatementPageIndex(0);
  }, [selectedDonor?.memberId, previewYear]);

  const statementCount = statementRows.length;
  const safeStatementIndex = Math.min(
    Math.max(0, statementPageIndex),
    Math.max(0, statementCount - 1)
  );
  const currentStatement = statementCount > 0 ? statementRows[safeStatementIndex] : undefined;

  React.useEffect(() => {
    setStatementPageIndex((i) => Math.min(i, Math.max(0, statementCount - 1)));
  }, [statementCount]);

  React.useEffect(() => {
    const q = donorInput.trim();
    if (suppressDonorSearchRef.current) {
      suppressDonorSearchRef.current = false;
      return;
    }
    if (q.length < 1) {
      setDonorSuggestions([]);
      setDonorSearchState('idle');
      return;
    }

    let cancelled = false;
    const t = window.setTimeout(() => {
      void (async () => {
        setDonorSearchState('loading');
        try {
          const res = await fetch(
            `/api/donations/donors?q=${encodeURIComponent(q)}`,
            { cache: 'no-store', headers: { Accept: 'application/json' } }
          );
          const json = (await res.json().catch(() => ({}))) as {
            donors?: DonorSuggestion[];
            error?: string;
          };
          if (cancelled) return;
          if (!res.ok) {
            throw new Error(json.error || 'Error al buscar donantes.');
          }
          setDonorSuggestions(json.donors ?? []);
          setDonorSearchState('ready');
        } catch {
          if (cancelled) return;
          setDonorSuggestions([]);
          setDonorSearchState('error');
        }
      })();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [donorInput]);

  React.useEffect(() => {
    if (!selectedDonor) {
      setStatementRows([]);
      setStatementTotal(0);
      setStatementState('idle');
      setStatementError(null);
      return;
    }

    let cancelled = false;
    setStatementState('loading');
    setStatementError(null);

    void (async () => {
      try {
        const params = new URLSearchParams({
          memberId: selectedDonor.memberId,
          year: String(previewYear),
        });
        const res = await fetch(`/api/donations/statement?${params.toString()}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json().catch(() => ({}))) as {
          donations?: StatementDonation[];
          total?: number;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(json.error || 'No se pudieron cargar las donaciones.');
        }
        setStatementRows(json.donations ?? []);
        setStatementTotal(typeof json.total === 'number' ? json.total : 0);
        setStatementState('ready');
      } catch (e) {
        if (cancelled) return;
        setStatementRows([]);
        setStatementTotal(0);
        setStatementState('error');
        setStatementError(e instanceof Error ? e.message : 'Error al cargar.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDonor, previewYear]);

  const pickDonor = (d: DonorSuggestion) => {
    suppressDonorSearchRef.current = true;
    setSelectedDonor(d);
    setDonorInput(donorDisplayName(d));
    setDonorSuggestions([]);
    setDonorSearchState('idle');
    setDonorListOpen(false);
  };

  const previewDonorLine = selectedDonor
    ? donorDisplayName(selectedDonor)
    : 'Seleccione un donante para ver su estado de cuenta';

  const donorContact = statementRows[0]?.donor ?? selectedDonor;
  const previewChurchName =
    statementRows.find((r) => r.churchName?.trim())?.churchName?.trim() || 'Su congregación';
  const headerChurchName =
    currentStatement?.churchName?.trim() || previewChurchName;

  const goStatementPrev = () => {
    setStatementPageIndex((i) => Math.max(0, i - 1));
  };

  const goStatementNext = () => {
    setStatementPageIndex((i) => Math.min(statementCount - 1, i + 1));
  };

  const canDownloadPdf =
    Boolean(selectedDonor) && statementState === 'ready' && statementRows.length > 0;

  const handleDownloadPdf = () => {
    if (!selectedDonor || statementRows.length === 0) return;
    const { doc, filename } = buildGivingStatementPdf({
      selectedDonor,
      statementRows,
      statementTotal,
      previewYear,
    });
    doc.save(filename);
  };

  const openEmailDialog = () => {
    if (!selectedDonor || statementRows.length === 0) return;
    const defaultEmail = statementRows[0]?.donor?.email?.trim() ?? '';
    setEmailTo(defaultEmail);
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedDonor || statementRows.length === 0) return;
    const trimmed = emailTo.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        variant: 'destructive',
        title: 'Correo inválido',
        description: 'Introduzca un correo electrónico válido.',
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { doc, filename } = buildGivingStatementPdf({
        selectedDonor,
        statementRows,
        statementTotal,
        previewYear,
      });
      const dataUri = doc.output('datauristring');
      const comma = dataUri.lastIndexOf(',');
      const pdfBase64 = comma >= 0 ? dataUri.slice(comma + 1) : '';
      if (!pdfBase64) {
        throw new Error('No se pudo codificar el PDF.');
      }

      const res = await fetch('/api/donations/giving-statement/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: trimmed,
          pdfBase64,
          filename,
          year: previewYear,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || 'No se pudo enviar el correo.');
      }
      toast({
        title: 'Correo enviado',
        description: json.message || 'Se envió el PDF por Gmail al destinatario indicado.',
      });
      setEmailDialogOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: e instanceof Error ? e.message : 'Inténtelo de nuevo.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Generar Estados de Cuenta de Donaciones"
        description="Cree y distribuya estados de cuenta de donaciones para sus miembros."
      >
        <div/>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="statement-year">Año del estado de cuenta</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="statement-year">
                      <SelectValue placeholder="Seleccione año" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATEMENT_YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Período: 1 de enero – 31 de diciembre del año elegido.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor-filter">Donantes</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="donor-filter"
                      className="pl-9"
                      placeholder="Todos los donantes"
                      autoComplete="off"
                      value={donorInput}
                      disabled={lockedDonor != null}
                      onChange={(e) => {
                        if (lockedDonor) return;
                        setDonorInput(e.target.value);
                        setSelectedDonor(null);
                        setDonorListOpen(true);
                      }}
                      onFocus={() => {
                        if (lockedDonor) return;
                        if (donorInput.trim().length >= 1) setDonorListOpen(true);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setDonorListOpen(false), 200);
                      }}
                    />
                  </div>
                  {lockedDonor == null && donorListOpen && donorInput.trim().length >= 1 ? (
                    <div
                      className="rounded-md border bg-background shadow-sm"
                      role="listbox"
                      aria-label="Sugerencias de donantes"
                    >
                      {donorSearchState === 'loading' ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando…</p>
                      ) : null}
                      {donorSearchState === 'error' ? (
                        <p className="px-3 py-2 text-sm text-destructive">
                          No se pudieron cargar los donantes.
                        </p>
                      ) : null}
                      {donorSearchState === 'ready' && donorSuggestions.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No hay donantes que coincidan en la base de datos.
                        </p>
                      ) : null}
                      {donorSuggestions.map((d) => (
                        <button
                          key={d.memberId}
                          type="button"
                          role="option"
                          className="flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pickDonor(d);
                          }}
                        >
                          <span className="text-sm font-medium">{donorDisplayName(d)}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {d.memberId}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {selectedDonor && !lockedDonor ? (
                    <button
                      type="button"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setSelectedDonor(null);
                        setDonorInput('');
                        setDonorSuggestions([]);
                      }}
                    >
                      Quitar filtro (todos los donantes)
                    </button>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Escriba para buscar por nombre en donaciones guardadas; deje vacío para todos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                <CardTitle>Vista previa del estado de cuenta</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedDonor && statementState === 'ready' && statementCount > 0 ? (
                    <div className="flex items-center gap-1 rounded-md border bg-background p-0.5 shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Aporte anterior"
                        disabled={safeStatementIndex <= 0}
                        onClick={goStatementPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[4.5rem] px-1 text-center text-sm tabular-nums text-muted-foreground">
                        {safeStatementIndex + 1} de {statementCount}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Siguiente aporte"
                        disabled={safeStatementIndex >= statementCount - 1}
                        onClick={goStatementNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                  <div className="text-sm text-muted-foreground">
                    {selectedDonor ? (
                      statementState === 'loading' ? (
                        <Skeleton className="inline-block h-4 w-36" />
                      ) : statementState === 'ready' && statementCount > 0 ? (
                        <span>
                          {statementCount} aporte{statementCount === 1 ? '' : 's'} en {previewYear}
                        </span>
                      ) : null
                    ) : (
                      <span>Seleccione año y donante</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-4 sm:p-8 bg-muted/30">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">{headerChurchName}</h2>
                                <p className="text-muted-foreground">Declaración de donación oficial</p>
                            </div>
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="text-sm">
                                  {headerChurchName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="mb-8">
                            <p className="font-semibold">{previewDonorLine}</p>
                            {selectedDonor ? (
                              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                <p>ID miembro: {selectedDonor.memberId}</p>
                                {donorContact && 'email' in donorContact && donorContact.email?.trim() ? (
                                  <p>{donorContact.email.trim()}</p>
                                ) : null}
                                {donorContact && 'phone' in donorContact && donorContact.phone?.trim() ? (
                                  <p>{donorContact.phone.trim()}</p>
                                ) : null}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-muted-foreground">
                                La vista previa muestra los aportes del año elegido.
                              </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
                            <div>
                                <p className="text-muted-foreground">Fecha del estado de cuenta:</p>
                                <p className="font-medium">
                                  {new Intl.DateTimeFormat('es-MX', {
                                    dateStyle: 'long',
                                  }).format(new Date())}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Período de donación:</p>
                                <p className="font-medium">
                                  1 de enero – 31 de diciembre de {previewYear}
                                </p>
                            </div>
                        </div>

                        {!selectedDonor ? (
                          <p className="rounded-md border border-dashed bg-muted/40 py-8 text-center text-sm text-muted-foreground">
                            Elija un donante en el panel izquierdo para cargar sus donaciones de{' '}
                            {previewYear}.
                          </p>
                        ) : statementState === 'loading' ? (
                          <div className="space-y-3 py-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : statementState === 'error' ? (
                          <p className="rounded-md border border-destructive/30 bg-destructive/5 py-6 text-center text-sm text-destructive">
                            {statementError}
                          </p>
                        ) : statementRows.length === 0 ? (
                          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                            No hay donaciones registradas para este donante en {previewYear}.
                          </p>
                        ) : currentStatement ? (
                          <div className="mb-6 space-y-4 rounded-md border bg-muted/20 p-4 sm:p-5">
                            <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-semibold">
                                Estado de cuenta del aporte {safeStatementIndex + 1} de{' '}
                                {statementCount}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                ID: {currentStatement.id}
                              </p>
                            </div>
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="text-muted-foreground">Fecha del aporte</dt>
                                <dd className="font-medium">
                                  {formatRowDate(currentStatement.donationDate)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Monto</dt>
                                <dd className="text-lg font-semibold">
                                  {formatMoney(currentStatement.amount)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Fondo / campaña</dt>
                                <dd className="font-medium">
                                  {FUND_LABELS[currentStatement.fundCampaign] ??
                                    currentStatement.fundCampaign}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Método de pago</dt>
                                <dd className="font-medium">
                                  {PAYMENT_LABELS[currentStatement.paymentMethod] ??
                                    currentStatement.paymentMethod}
                                </dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Templo</dt>
                                <dd className="font-medium">{currentStatement.churchName}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Evento</dt>
                                <dd className="font-medium">
                                  {currentStatement.attendanceEvent?.name ?? '—'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        ) : null}

                        <div className="border-t pt-6 mt-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-lg font-medium">
                                  Contribuciones totales para {previewYear}:
                                </p>
                                <p className="text-2xl font-bold">
                                  {selectedDonor && statementState === 'ready'
                                    ? formatMoney(statementTotal)
                                    : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              type="button"
                              disabled={!canDownloadPdf}
                              title={
                                canDownloadPdf
                                  ? 'Descargar PDF con el detalle de todas las donaciones del período'
                                  : 'Seleccione un donante con donaciones en el año elegido'
                              }
                              onClick={handleDownloadPdf}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              type="button"
                              disabled={!canDownloadPdf}
                              title={
                                canDownloadPdf
                                  ? 'Enviar el mismo PDF por correo (Gmail)'
                                  : 'Seleccione un donante con donaciones en el año elegido'
                              }
                              onClick={openEmailDialog}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar por correo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar estado de cuenta por correo</DialogTitle>
            <DialogDescription>
              Se adjuntará el mismo PDF de la vista previa. El envío se realiza con la cuenta Gmail
              configurada en el servidor (Google).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="email-statement">Correo del destinatario</Label>
            <Input
              id="email-statement"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              disabled={sendingEmail}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              disabled={sendingEmail}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleSendEmail()} disabled={sendingEmail}>
              {sendingEmail ? 'Enviando…' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
