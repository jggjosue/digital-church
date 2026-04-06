
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { membersData } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import type { MinistryDocument } from '@/lib/ministries';

const statusColors: { [key: string]: string } = {
    Activo: 'bg-green-100 text-green-800 border-green-200',
    Visitante: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Inactivo: 'bg-red-100 text-red-800 border-red-200',
};

type Member = (typeof membersData)[0];
type ApiMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipStatus: string;
};

type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
};

function membershipStatusLabel(code: string): string {
  const map: Record<string, string> = {
    active: 'Activo',
    visitor: 'Visitante',
    inactive: 'Inactivo',
  };
  return map[code] ?? 'Activo';
}

export default function AssignMembersToMinistryPage() {
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [selectedMinistryId, setSelectedMinistryId] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [ministries, setMinistries] = React.useState<MinistryDocument[]>([]);
  const [ministriesLoadState, setMinistriesLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [memberRows, setMemberRows] = React.useState<MemberRow[]>([]);
  const [membersLoadState, setMembersLoadState] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setMinistriesLoadState('loading');
      try {
        const res = await fetch('/api/ministries', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ministries?: MinistryDocument[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'No se pudieron cargar los ministerios.');
        }
        if (cancelled) return;
        setMinistries(data.ministries ?? []);
        setMinistriesLoadState('ready');
      } catch {
        if (cancelled) return;
        setMinistries([]);
        setMinistriesLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddMembers = () => {
    // Simulate API call
    const isSuccess = Math.random() > 0.3; // Simulate success or failure
    if (isSuccess) {
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(true);
      setShowSuccess(false);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, id]);
    } else {
      setSelectedMembers((prev) => prev.filter((i) => i !== id));
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      void (async () => {
        setMembersLoadState('loading');
        try {
          const q = searchTerm.trim();
          const selectedMinistryName =
            ministries.find((m) => m.id === selectedMinistryId)?.name?.trim() ?? '';
          const params = new URLSearchParams();
          params.set('limit', '20');
          if (q) params.set('q', q);
          if (selectedMinistryName) params.set('group', selectedMinistryName);
          const url = `/api/members?${params.toString()}`;
          const res = await fetch(url, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          });
          const data = (await res.json().catch(() => ({}))) as {
            members?: ApiMember[];
            error?: string;
          };
          if (!res.ok) {
            throw new Error(data.error || 'No se pudieron cargar miembros.');
          }
          if (cancelled) return;
          const rows = (data.members ?? []).map((m) => ({
            id: String(m.id),
            name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || 'Sin nombre',
            email: m.email ?? '',
            phone: m.phone ?? '',
            status: membershipStatusLabel(m.membershipStatus),
          }));
          setMemberRows(rows);
          setMembersLoadState('ready');
        } catch {
          if (cancelled) return;
          setMemberRows([]);
          setMembersLoadState('error');
        }
      })();
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm, selectedMinistryId, ministries]);

  const filteredMembers = React.useMemo(() => memberRows, [memberRows]);

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Asignar Miembros a un Ministerio"
        description={
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/ministries">Ministerios</Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Asignar Miembros</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        }
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button variant="ghost" asChild><Link href="/ministries">Cancelar</Link></Button>
            <Button onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
                <Plus className="mr-2 h-4 w-4" /> Asignar {selectedMembers.length > 0 ? selectedMembers.length : ''} {selectedMembers.length === 1 ? 'Miembro' : 'Miembros'}
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="space-y-4 max-w-5xl mx-auto">
        {showSuccess && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="font-semibold">Éxito</AlertTitle>
                <AlertDescription>
                    Los miembros seleccionados han sido asignados exitosamente al ministerio.
                </AlertDescription>
            </Alert>
        )}
        {showError && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No se pudieron asignar los miembros. Por favor, intente de nuevo.
                </AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Seleccionar Miembros y Ministerio</CardTitle>
                <CardDescription>
                    Primero, seleccione el ministerio de destino y luego elija los miembros para asignar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className='flex-1'>
                        <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un ministerio..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ministriesLoadState === 'loading' ? (
                                  <SelectItem value="__loading__" disabled>
                                    Cargando ministerios...
                                  </SelectItem>
                                ) : null}
                                {ministriesLoadState === 'error' ? (
                                  <SelectItem value="__error__" disabled>
                                    No se pudieron cargar los ministerios
                                  </SelectItem>
                                ) : null}
                                {ministriesLoadState === 'ready' && ministries.length === 0 ? (
                                  <SelectItem value="__empty__" disabled>
                                    No hay ministerios registrados
                                  </SelectItem>
                                ) : null}
                                {ministriesLoadState === 'ready'
                                  ? ministries.map((ministry) => (
                                      <SelectItem key={ministry.id} value={ministry.id}>
                                        {ministry.name}
                                      </SelectItem>
                                    ))
                                  : null}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nombre, email o número de teléfono..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} /></TableHead>
                                <TableHead>NOMBRE</TableHead>
                                <TableHead>CONTACTO</TableHead>
                                <TableHead>ESTADO</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {membersLoadState === 'loading' ? (
                              <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                  Buscando miembros en la base de datos...
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {membersLoadState === 'error' ? (
                              <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-destructive">
                                  No se pudo consultar la colección members.
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {membersLoadState === 'ready'
                              ? filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedMembers.includes(member.id)}
                                            onCheckedChange={(checked) => handleSelectOne(member.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://picsum.photos/seed/${encodeURIComponent(member.id)}/40/40`} alt={member.name} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusColors[member.status as keyof typeof statusColors]}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                              : null}
                            {membersLoadState === 'ready' && filteredMembers.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                  No hay miembros que coincidan con la búsqueda.
                                </TableCell>
                              </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>

    </main>
    </div>
  );
}
