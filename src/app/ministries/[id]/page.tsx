'use client';

import * as React from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import type { MinistryDocument } from '@/lib/ministries';
import { ministryCategoryLabel } from '@/lib/ministries';

const statusColors: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800 border-green-200',
  Inactivo: 'bg-red-100 text-red-800 border-red-200',
  Visitante: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const roleColors: Record<string, string> = {
  Líder: 'bg-blue-100 text-blue-800 border-blue-200',
  Miembro: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function MinistryDetailsPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [ministry, setMinistry] = React.useState<MinistryDocument | null>(null);
  const [loadState, setLoadState] = React.useState<'loading' | 'error' | 'ready'>('loading');
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id?.trim()) {
      setLoadState('error');
      setMessage('Identificador no válido.');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setMessage(null);
      try {
        const res = await fetch(`/api/ministries/${encodeURIComponent(id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ministry?: MinistryDocument;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo cargar el ministerio.');
        }
        if (cancelled) return;
        if (!data.ministry) {
          setLoadState('error');
          setMessage('No se recibieron datos.');
          return;
        }
        setMinistry(data.ministry);
        setLoadState('ready');
      } catch (e) {
        if (!cancelled) {
          setLoadState('error');
          setMessage(e instanceof Error ? e.message : 'Error al cargar.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadState === 'loading') {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader title="Ministerio" description="Cargando…" />
        <main className="flex-1 p-8">
          <p className="text-sm text-muted-foreground">Cargando ministerio…</p>
        </main>
      </div>
    );
  }

  if (loadState === 'error' || !ministry) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader title="Ministerio no encontrado" description={message ?? 'No existe este ministerio.'} />
        <main className="flex-1 p-8">
          <Button variant="outline" asChild>
            <Link href="/ministries">Volver a ministerios</Link>
          </Button>
        </main>
      </div>
    );
  }

  const rows = ministry.leaders.map((leader) => ({
    key: leader.id,
    name: leader.name,
    email: leader.email,
    phone: '—',
    role: 'Líder' as const,
    status: 'Activo',
  }));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title={ministry.name}
        description={`${ministryCategoryLabel(ministry.category)} · ${ministry.description}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/ministries/${ministry.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Ministerio
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/ministries/assign-members?ministryId=${encodeURIComponent(ministry.id)}`}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Miembros
            </Link>
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Líderes y equipo ({rows.length})</CardTitle>
            <CardDescription>
              Personas registradas como líderes de {ministry.name}. Total contabilizado:{' '}
              {ministry.memberCount} miembros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o email..." className="pl-9" disabled />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NOMBRE</TableHead>
                    <TableHead>CONTACTO</TableHead>
                    <TableHead>ROL</TableHead>
                    <TableHead>ESTADO DEL MIEMBRO</TableHead>
                    <TableHead className="text-right">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay líderes en este registro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((member) => (
                      <TableRow key={member.key}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={`https://picsum.photos/seed/${encodeURIComponent(member.key)}/40/40`}
                                alt={member.name}
                              />
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
                          <Badge
                            variant="outline"
                            className={roleColors[member.role] ?? roleColors.Miembro}
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[member.status] ?? statusColors.Activo}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" type="button" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" type="button" disabled>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
