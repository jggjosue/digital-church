'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Church,
  Link2,
  Loader2,
  Plus,
  Search,
  Wifi,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { dedupeChurchesById, type ChurchLocation } from '@/lib/church-locations';

type ChurchItem = { id: string; name: string; address?: string; municipality?: string };

const CATEGORIES = [
  'Jóvenes',
  'Femenil',
  'Varones',
  'Oración',
  'Células',
  'Culto general',
  'Predicación',
  'Campamento',
  'Retiro',
  'Conferencia',
  'Evangelismo',
  'Otro',
];

const PLATFORMS = [
  'YouTube',
  'Facebook Live',
  'Zoom',
  'TikTok Live',
  'Twitch',
  'Google Meet',
  'Microsoft Teams',
  'WhatsApp',
  'Otro',
];

const RECURRENCES = [
  { value: 'once', label: 'Una sola vez' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'concurrent', label: 'Concurrente' },
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function normalizeSearch(v: string) {
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export default function NuevoEventoOnlinePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [customCategory, setCustomCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [platform, setPlatform] = React.useState('');
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [recurrence, setRecurrence] = React.useState<'once' | 'weekly' | 'biweekly' | 'monthly' | 'concurrent'>('once');
  const [weekdays, setWeekdays] = React.useState<string[]>([]);
  const [meetingLink, setMeetingLink] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  // Churches state
  const [allChurches, setAllChurches] = React.useState<ChurchItem[]>([]);
  const [churchSearch, setChurchSearch] = React.useState('');
  const [churchesLoading, setChurchesLoading] = React.useState(true);
  const [selectedChurches, setSelectedChurches] = React.useState<ChurchItem[]>([]);

  React.useEffect(() => {
    void (async () => {
      setChurchesLoading(true);
      try {
        const res = await fetch('/api/churches?sessionChurchScope=1', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json().catch(() => ({}))) as { churches?: ChurchLocation[] };
        const list = dedupeChurchesById(json.churches ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          municipality: c.city || c.municipality || '',
        }));
        setAllChurches(list.sort((a, b) => a.name.localeCompare(b.name, 'es')));
      } catch {
        // silently fail
      } finally {
        setChurchesLoading(false);
      }
    })();
  }, []);

  const filteredChurches = React.useMemo(() => {
    const q = normalizeSearch(churchSearch);
    if (!q) return allChurches;
    return allChurches.filter((c) =>
      normalizeSearch(`${c.name} ${c.address ?? ''} ${c.municipality ?? ''}`).includes(q)
    );
  }, [allChurches, churchSearch]);

  const toggleChurch = (church: ChurchItem) => {
    setSelectedChurches((prev) =>
      prev.some((c) => c.id === church.id)
        ? prev.filter((c) => c.id !== church.id)
        : [...prev, church]
    );
  };

  const isSelected = (id: string) => selectedChurches.some((c) => c.id === id);
  const effectiveCategory = category === 'Otro' ? customCategory.trim() : category;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido.';
    if (!effectiveCategory) errs.category = 'Selecciona una categoría.';
    if (!platform) errs.platform = 'Selecciona una plataforma.';
    if (!scheduledAt) errs.scheduledAt = 'La fecha y hora son requeridas.';
    if (meetingLink && !meetingLink.startsWith('http')) errs.meetingLink = 'El link debe empezar con http:// o https://';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ variant: 'destructive', title: 'Faltan campos', description: 'Revisa los campos marcados.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/online/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: effectiveCategory,
          description: description.trim(),
          platform,
          scheduledAt,
          recurrence,
          weekday: weekdays[0] ?? '',
          weekdays,
          meetingLink: meetingLink.trim(),
          participatingChurches: selectedChurches.map((c) => ({ id: c.id, name: c.name })),
          notes: notes.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error || 'Error al guardar.');
      toast({ title: '¡Evento creado!', description: json.message });
      router.push('/online/servicio');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error al guardar', description: e instanceof Error ? e.message : 'Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Nuevo Evento Online"
        description="Configura el evento virtual y selecciona los templos participantes."
      >
        <Button variant="outline" asChild>
          <Link href="/online/servicio">Cancelar</Link>
        </Button>
      </AppHeader>

      <main className="flex-1 bg-muted/20 p-4 pb-28 sm:p-8 sm:pb-28">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* ─── Información del evento ─── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información del evento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Nombre */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="event-name">
                  Nombre del evento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-name"
                  placeholder="Ej. Reunión de Jóvenes, Vigilia Femenil, Oración Semanal…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(errors.name && 'border-destructive')}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Categoría */}
              <div className="space-y-1.5">
                <Label>
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={cn(errors.category && 'border-destructive')}>
                    <SelectValue placeholder="Selecciona tipo de reunión" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category === 'Otro' && (
                  <Input
                    placeholder="Nombre de la categoría…"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-1"
                  />
                )}
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              {/* Plataforma */}
              <div className="space-y-1.5">
                <Label>
                  Plataforma <span className="text-destructive">*</span>
                </Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className={cn(errors.platform && 'border-destructive')}>
                    <SelectValue placeholder="YouTube, Zoom, Facebook…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && <p className="text-xs text-destructive">{errors.platform}</p>}
              </div>

              {/* Fecha y hora */}
              <div className="space-y-1.5">
                <Label htmlFor="event-date">
                  Fecha y hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={cn(errors.scheduledAt && 'border-destructive')}
                />
                {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt}</p>}
              </div>

              {/* Recurrencia */}
              <div className="space-y-1.5">
                <Label>Frecuencia</Label>
                <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RECURRENCES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Días de la semana — multi-selección */}
              <div className="space-y-2 md:col-span-2">
                <Label>Días de la semana</Label>
                <p className="text-xs text-muted-foreground">
                  Selecciona uno o más días en que ocurre este evento.
                </p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = weekdays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setWeekdays((prev) =>
                            prev.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...prev, day]
                          )
                        }
                        className={cn(
                          'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-muted'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {weekdays.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Seleccionados: {weekdays.join(', ')}
                  </p>
                )}
              </div>

              {/* Link */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="meeting-link">Link de la transmisión (opcional)</Label>
                <Input
                  id="meeting-link"
                  placeholder="https://youtube.com/live/… o https://zoom.us/j/…"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className={cn(errors.meetingLink && 'border-destructive')}
                />
                {errors.meetingLink && <p className="text-xs text-destructive">{errors.meetingLink}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="event-desc">Descripción (opcional)</Label>
                <Textarea
                  id="event-desc"
                  placeholder="Tema del mensaje, expositor, instrucciones de conexión…"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Notas */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="event-notes">Notas internas (opcional)</Label>
                <Textarea
                  id="event-notes"
                  placeholder="Contraseña de Zoom, observaciones para el equipo…"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Templos participantes ─── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Templos participantes</CardTitle>
                {selectedChurches.length > 0 && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    {selectedChurches.length} seleccionado{selectedChurches.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona los templos que se unirán a este evento online.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* Selected chips */}
              {selectedChurches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-3">
                  {selectedChurches.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium"
                    >
                      {c.name}
                      <button
                        type="button"
                        onClick={() => toggleChurch(c)}
                        className="ml-0.5 rounded-full opacity-60 hover:opacity-100"
                        aria-label={`Quitar ${c.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Church search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar templo por nombre o ciudad…"
                  className="pl-9"
                  value={churchSearch}
                  onChange={(e) => setChurchSearch(e.target.value)}
                />
              </div>

              {/* Church list */}
              {churchesLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando templos…
                </div>
              ) : filteredChurches.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No hay templos que coincidan.</p>
              ) : (
                <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
                  {filteredChurches.map((church) => {
                    const selected = isSelected(church.id);
                    return (
                      <button
                        key={church.id}
                        type="button"
                        onClick={() => toggleChurch(church)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          selected && 'bg-muted/40'
                        )}
                      >
                        <span className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}>
                          {selected && <Check className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{church.name}</p>
                          {(church.address || church.municipality) && (
                            <p className="truncate text-xs text-muted-foreground">
                              {[church.address, church.municipality].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating save bar */}
      <div className="sticky bottom-0 z-10 flex border-t bg-background/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur sm:justify-end sm:px-8">
        <div className="flex w-full gap-3 sm:w-auto">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href="/online/servicio">Cancelar</Link>
          </Button>
          <Button
            type="button"
            className="flex-1 sm:flex-none sm:min-w-[200px]"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando…</>
            ) : (
              <><CheckCircle2 className="mr-2 h-4 w-4" />Crear Evento Online</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
