'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
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
import { AppHeader } from '@/components/app-header';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { dedupeChurchesById, type ChurchLocation } from '@/lib/church-locations';

const COUNTRY_LABELS: Record<string, string> = {
  usa: 'Estados Unidos',
  canada: 'Canadá',
  mexico: 'México',
};

type LocationRow = {
  id: string;
  name: string;
  address: string;
  phone: string;
  country: string;
  state: string;
  lat: number;
  lng: number;
  embedUrl: string;
};

function mapDocToRow(doc: ChurchLocation): LocationRow {
  return {
    id: doc.id,
    name: doc.name,
    address: doc.address,
    phone: doc.phone ?? '',
    country: doc.country || 'mexico',
    state: doc.municipality || doc.city || '',
    lat: doc.lat,
    lng: doc.lng,
    embedUrl: doc.embedUrl,
  };
}

export default function ChurchesPage() {
  const [locations, setLocations] = React.useState<LocationRow[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<LocationRow | null>(null);
  const [countryFilter, setCountryFilter] = React.useState<string>('all');
  const [stateFilter, setStateFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setLoadError(null);
      try {
        const res = await fetch('/api/churches', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          churches?: ChurchLocation[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar las ubicaciones.');
        }
        if (cancelled) return;
        const rows = dedupeChurchesById(data.churches ?? []).map(mapDocToRow);
        setLocations(rows);
        setSelectedLocation(rows[0] ?? null);
        setLoadState('ready');
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

  const countryCodesInData = React.useMemo(() => {
    const set = new Set(locations.map((l) => l.country));
    return Array.from(set).sort();
  }, [locations]);

  const stateOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const loc of locations) {
      if (countryFilter === 'all' || loc.country === countryFilter) {
        set.add(loc.state);
      }
    }
    return Array.from(set).sort();
  }, [locations, countryFilter]);

  React.useEffect(() => {
    if (stateFilter === 'all') return;
    if (!stateOptions.includes(stateFilter)) {
      setStateFilter('all');
    }
  }, [countryFilter, stateFilter, stateOptions]);

  const filteredLocations = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((loc) => {
      if (countryFilter !== 'all' && loc.country !== countryFilter) return false;
      if (stateFilter !== 'all' && loc.state !== stateFilter) return false;
      if (q) {
        const haystack = `${loc.name} ${loc.address}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [locations, countryFilter, stateFilter, searchQuery]);

  React.useEffect(() => {
    if (filteredLocations.length === 0) return;
    if (!selectedLocation) {
      setSelectedLocation(filteredLocations[0]);
      return;
    }
    const stillVisible = filteredLocations.some((l) => l.id === selectedLocation.id);
    if (!stillVisible) {
      setSelectedLocation(filteredLocations[0]);
    }
  }, [filteredLocations, selectedLocation]);

  return (
    <div className="flex h-screen flex-1 flex-col">
      <AppHeader
        title="Ubicaciones de la Iglesia"
        description="Gestione y vea las ubicaciones geográficas de su iglesia."
      >
        <Button asChild>
          <Link href="/churches/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Ubicación
          </Link>
        </Button>
      </AppHeader>
      <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="w-full border-b md:w-96 md:border-b-0 md:border-r">
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="country-select" className="text-sm font-medium text-muted-foreground">
                  País
                </label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger id="country-select">
                    <SelectValue placeholder="Todos los Países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Países</SelectItem>
                    {countryCodesInData.map((code) => (
                      <SelectItem key={code} value={code}>
                        {COUNTRY_LABELS[code] ?? code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="state-select" className="text-sm font-medium text-muted-foreground">
                  Municipio
                </label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger id="state-select">
                    <SelectValue placeholder="Todos los municipios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los municipios</SelectItem>
                    {stateOptions.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o dirección..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar por nombre o dirección"
              />
            </div>
          </div>
          <div className="max-h-[40vh] flex-1 overflow-y-auto md:max-h-none">
            {loadState === 'loading' ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Cargando ubicaciones…</p>
            ) : null}
            {loadState === 'error' ? (
              <p className="p-4 text-center text-sm text-destructive">{loadError}</p>
            ) : null}
            {loadState === 'ready' && filteredLocations.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No hay ubicaciones que coincidan con los filtros.
              </p>
            ) : null}
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className={cn(
                  'cursor-pointer border-t p-4',
                  selectedLocation?.id === location.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                )}
                onClick={() => setSelectedLocation(location)}
              >
                <h3
                  className={cn(
                    'font-semibold',
                    selectedLocation?.id === location.id && 'text-foreground'
                  )}
                >
                  {location.name}
                </h3>
                <p className="text-sm">{location.address}</p>
                {location.phone ? (
                  <p className="text-sm text-muted-foreground">{location.phone}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex-1 bg-muted/20">
          {selectedLocation ? (
            <>
              <iframe
                width="100%"
                height="100%"
                frameBorder={0}
                style={{ border: 0 }}
                title={`Mapa: ${selectedLocation.name}`}
                src={selectedLocation.embedUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <Card className="w-80 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold">{selectedLocation.name}</h3>
                    <p className="mt-1 text-sm">{selectedLocation.address}</p>
                    {selectedLocation.phone ? (
                      <p className="mt-1 text-sm text-muted-foreground">{selectedLocation.phone}</p>
                    ) : null}
                    <Link
                      href={`/churches/${selectedLocation.id}`}
                      className="mt-4 inline-block text-sm font-medium text-black hover:underline dark:text-white"
                    >
                      Ver Detalles
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center p-8 text-sm text-muted-foreground">
              No hay ubicaciones para mostrar.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
