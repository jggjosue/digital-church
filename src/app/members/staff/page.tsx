
'use client';

import * as React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Mail,
  Menu,
  Phone,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type PastorApi = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Activo' | 'Visitante' | 'Inactivo';
  email: string;
  phone: string;
  avatarUrl: string | null;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Activo' | 'Visitante' | 'Inactivo';
  email: string;
  phone: string;
  avatarUrl: string | null;
};

function mapPastorApiToStaff(doc: PastorApi): StaffMember {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    department: doc.department,
    status: doc.status,
    email: doc.email,
    phone: doc.phone,
    avatarUrl: doc.avatarUrl,
  };
}

function StaffProfilePanel({ staff }: { staff: StaffMember }) {
  const initials = staff.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      <SheetHeader>
        <SheetTitle>Perfil del personal</SheetTitle>
        <SheetDescription>
          Datos de contacto, departamento y estado de {staff.name} en el directorio
          de personal.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-8 flex flex-col items-center gap-6">
        <Avatar className="h-28 w-28">
          <AvatarImage
            src={staff.avatarUrl || undefined}
            alt={`Fotografía de ${staff.name}`}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="w-full text-center">
          <p className="text-2xl font-bold">{staff.name}</p>
          <p className="mt-1 text-base font-medium text-primary">{staff.role}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Estado:{' '}
            <span
              className={
                staff.status === 'Activo'
                  ? 'text-green-600'
                  : staff.status === 'Visitante'
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
              }
            >
              {staff.status}
            </span>
          </p>
        </div>
        <dl className="w-full space-y-5 text-sm">
          <div>
            <dt className="text-muted-foreground">Departamento</dt>
            <dd className="mt-1.5 font-medium">{staff.department}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Correo electrónico</dt>
            <dd className="mt-1.5 flex items-start gap-2 font-medium">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <a
                href={`mailto:${staff.email}`}
                className="break-all text-primary hover:underline"
              >
                {staff.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Teléfono</dt>
            <dd className="mt-1.5 flex items-center gap-2 font-medium">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={`tel:${staff.phone.replace(/\D/g, '')}`} className="hover:underline">
                {staff.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Identificador</dt>
            <dd className="mt-1.5 font-mono text-xs text-muted-foreground">#{staff.id}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

type StaffStatus = StaffMember['status'];

type StaffFilterPanelProps = {
  role: string;
  roleOptions: string[];
  status: StaffStatus[];
  onRoleChange: (value: string) => void;
  onStatusToggle: (value: StaffStatus, checked: boolean) => void;
};

function FilterPanelFields({
  role,
  roleOptions,
  status,
  onRoleChange,
  onStatusToggle,
}: StaffFilterPanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Listado de pastores desde la colección members (staffRole = Pastor).
      </p>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Rol / Posición</h3>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Todos los roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Si no selecciona ninguno, se incluyen todos los estados.
        </p>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="staff-filter-activo"
              checked={status.includes('Activo')}
              onCheckedChange={(checked) => onStatusToggle('Activo', !!checked)}
            />
            <Label htmlFor="staff-filter-activo" className="text-sm font-normal">
              Activo
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="staff-filter-visitante"
              checked={status.includes('Visitante')}
              onCheckedChange={(checked) => onStatusToggle('Visitante', !!checked)}
            />
            <Label htmlFor="staff-filter-visitante" className="text-sm font-normal">
              Visitante
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="staff-filter-inactivo"
              checked={status.includes('Inactivo')}
              onCheckedChange={(checked) => onStatusToggle('Inactivo', !!checked)}
            />
            <Label htmlFor="staff-filter-inactivo" className="text-sm font-normal">
              Inactivo
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function filterStaffList(
  list: StaffMember[],
  search: string,
  role: string,
  status: StaffStatus[]
): StaffMember[] {
  let out = list;
  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }
  if (role !== 'all') {
    out = out.filter((s) => s.role === role);
  }
  if (status.length > 0) {
    out = out.filter((s) => status.includes(s.status));
  }
  return out;
}

export default function StaffDirectoryPage() {
    const [view, setView] = React.useState<'list' | 'grid'>('grid');
    const [filtersPanelOpen, setFiltersPanelOpen] = React.useState(true);
    const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('all');
    const [statusFilters, setStatusFilters] = React.useState<StaffStatus[]>([]);
    const [pastoralStaff, setPastoralStaff] = React.useState<StaffMember[]>([]);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        setLoadError(null);
        try {
          const res = await fetch('/api/staff/pastors');
          const data = (await res.json().catch(() => ({}))) as {
            pastors?: PastorApi[];
            error?: string;
          };
          if (!res.ok) {
            throw new Error(data.error || 'No se pudo cargar el directorio.');
          }
          const rows = Array.isArray(data.pastors)
            ? data.pastors.map(mapPastorApiToStaff)
            : [];
          if (!cancelled) {
            setPastoralStaff(rows);
          }
        } catch (e) {
          if (!cancelled) {
            setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
            setPastoralStaff([]);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    const roleOptions = React.useMemo(
      () =>
        [...new Set(pastoralStaff.map((s) => s.role))].sort((a, b) =>
          a.localeCompare(b, 'es')
        ),
      [pastoralStaff]
    );

    const handleStatusToggle = (value: StaffStatus, checked: boolean) => {
      setStatusFilters((prev) =>
        checked ? [...prev, value] : prev.filter((s) => s !== value)
      );
    };

    const filteredStaff = React.useMemo(
      () =>
        filterStaffList(pastoralStaff, searchTerm, roleFilter, statusFilters),
      [pastoralStaff, searchTerm, roleFilter, statusFilters]
    );

    const filterPanelProps: StaffFilterPanelProps = {
      role: roleFilter,
      roleOptions,
      status: statusFilters,
      onRoleChange: setRoleFilter,
      onStatusToggle: handleStatusToggle,
    };

    const Filters = () => (
        <>
            <h2 className="text-xl font-semibold">Filtros</h2>
            <div className="mt-6">
              <FilterPanelFields {...filterPanelProps} />
            </div>
        </>
    );

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Directorio pastoral"
        description="Pastores de la colección members, validados por staffRole igual a Pastor."
      >
        <Button asChild>
          <Link href="/members">
            <Plus className="mr-2 h-4 w-4" /> Añadir nuevo miembro del personal
          </Link>
        </Button>
      </AppHeader>
      <main className="flex flex-1 bg-muted/20">
        <aside
          className={cn(
            'hidden shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-200 ease-in-out lg:flex',
            filtersPanelOpen ? 'w-80' : 'w-14'
          )}
        >
          <div
            className={cn(
              'flex shrink-0 items-center gap-3 border-b border-border/40 p-4',
              !filtersPanelOpen && 'flex-col justify-center gap-2 py-4'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setFiltersPanelOpen((o) => !o)}
              aria-expanded={filtersPanelOpen}
              aria-label={
                filtersPanelOpen ? 'Contraer panel de filtros' : 'Expandir panel de filtros'
              }
            >
              <Menu className="h-5 w-5" />
            </Button>
            {filtersPanelOpen ? (
              <h2 className="text-xl font-semibold">Filtros</h2>
            ) : null}
          </div>
          {filtersPanelOpen ? (
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <FilterPanelFields {...filterPanelProps} />
            </div>
          ) : null}
        </aside>
        <div className="flex-1 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, cargo, departamento o contacto…"
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Buscar en el directorio de personal"
                    />
                </div>
                <div className='flex items-center gap-2 self-end sm:self-center'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filtros</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px]">
                            <div className="p-6">
                                <Filters />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className='hidden sm:inline-block text-sm text-muted-foreground'>Vista:</span>
                    <Button
                      variant={view === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setView('grid')}
                      aria-label="Vista en cuadrícula"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                     <Button
                       variant={view === 'list' ? 'secondary' : 'ghost'}
                       size="icon"
                       onClick={() => setView('list')}
                       aria-label="Vista en lista"
                     >
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {loadError ? (
              <p className="py-12 text-center text-sm text-destructive">{loadError}</p>
            ) : null}

            {!loadError && loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Cargando directorio…</p>
            ) : null}

            {!loadError && !loading && filteredStaff.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No hay pastores en members con staffRole igual a Pastor, o ningún resultado coincide con los
                filtros y la búsqueda.
              </p>
            ) : null}

            {view === 'grid' && filteredStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStaff.map((staff) => (
                        <Card key={staff.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <Avatar className='h-24 w-24'>
                                        <AvatarImage
                                          src={staff.avatarUrl ?? undefined}
                                          alt={`Fotografía de ${staff.name}`}
                                        />
                                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-center">
                                        <h3 className="text-xl font-bold">{staff.name}</h3>
                                        <p className="text-primary">{staff.role}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {staff.department}
                                        </p>
                                        <div className='mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground'>
                                            <div className='flex items-center gap-2'>
                                                <Mail className='h-4 w-4'/>
                                                <span>{staff.email}</span>
                                            </div>
                                             <div className='flex items-center gap-2'>
                                                <Phone className='h-4 w-4'/>
                                                <span>{staff.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full sm:w-auto"
                                      onClick={() => setSelectedStaff(staff)}
                                    >
                                      Ver Perfil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : null}

            {view === 'list' && filteredStaff.length > 0 ? (
                <Card>
                    <CardContent className='p-0'>
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead className='text-right'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStaff.map((staff) => (
                                        <TableRow key={staff.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className='h-10 w-10'>
                                                        <AvatarImage
                                                          src={staff.avatarUrl ?? undefined}
                                                          alt={`Fotografía de ${staff.name}`}
                                                        />
                                                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span className='font-medium'>{staff.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-primary'>{staff.role}</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {staff.department}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                    <Mail className='h-4 w-4'/>
                                                    <span>{staff.email}</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                                                    <Phone className='h-4 w-4'/>
                                                    <span>{staff.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  onClick={() => setSelectedStaff(staff)}
                                                >
                                                  Ver Perfil
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Sheet
              open={selectedStaff !== null}
              onOpenChange={(open) => {
                if (!open) setSelectedStaff(null);
              }}
            >
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                {selectedStaff ? <StaffProfilePanel staff={selectedStaff} /> : null}
              </SheetContent>
            </Sheet>
        </div>
      </main>
    </div>
  );
}
