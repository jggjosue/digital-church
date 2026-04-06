'use client';

import * as React from 'react';
import { LayoutGrid, List, MapPin, Phone, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';
import { dedupeChurchesById, type ChurchLocation } from '@/lib/church-locations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
};

function mapDocToRow(doc: ChurchLocation): LocationRow {
  return {
    id: doc.id,
    name: doc.name,
    address: doc.address,
    phone: doc.phone ?? '',
    country: doc.country || 'mexico',
    state: doc.municipality || doc.city || '',
  };
}

export default function ChurchesPage() {
  const [locations, setLocations] = React.useState<LocationRow[]>([]);
  const [loadState, setLoadState] = React.useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [countryFilter, setCountryFilter] = React.useState<string>('all');
  const [stateFilter, setStateFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [view, setView] = React.useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

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
    setCurrentPage(1);
  }, [searchQuery, countryFilter, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / itemsPerPage));
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Ubicaciones de la Iglesia"
        description="Gestione los templos registrados en la base de datos."
      >
        <Button asChild>
          <Link href="/churches/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Ubicación
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por templo o dirección..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar templos"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger aria-label="Filtrar por país">
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
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger aria-label="Filtrar por municipio">
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
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant={view === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('table')}
                >
                  <List className="h-5 w-5" />
                </Button>
                <Button
                  variant={view === 'card' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('card')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadState === 'loading' ? (
              <div className="py-12 text-center text-muted-foreground">Cargando templos…</div>
            ) : null}
            {loadState === 'error' ? (
              <div className="py-12 text-center text-destructive">{loadError}</div>
            ) : null}
            {loadState === 'ready' && filteredLocations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No hay templos que coincidan con los filtros.
              </div>
            ) : null}

            {loadState === 'ready' && filteredLocations.length > 0 && view === 'table' ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Templo</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLocations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell>
                          <div className="font-medium">{loc.name}</div>
                          <div className="text-sm text-muted-foreground">{loc.address}</div>
                        </TableCell>
                        <TableCell>
                          {loc.phone ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {loc.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin teléfono</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {loc.state || 'Sin municipio'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{COUNTRY_LABELS[loc.country] ?? loc.country}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" asChild>
                            <Link href={`/churches/${loc.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}

            {loadState === 'ready' && filteredLocations.length > 0 && view === 'card' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedLocations.map((loc) => (
                  <Card key={loc.id}>
                    <CardContent className="space-y-3 p-5">
                      <div className="text-lg font-semibold">{loc.name}</div>
                      <div className="text-sm text-muted-foreground">{loc.address}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {loc.state || 'Sin municipio'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {loc.phone || 'Sin teléfono'}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline">{COUNTRY_LABELS[loc.country] ?? loc.country}</Badge>
                        <Button variant="outline" asChild>
                          <Link href={`/churches/${loc.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {loadState === 'ready' && filteredLocations.length > 0 ? (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLocations.length)} a{' '}
                  {Math.min(currentPage * itemsPerPage, filteredLocations.length)} de {filteredLocations.length}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage((p) => p - 1);
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={i + 1 === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
