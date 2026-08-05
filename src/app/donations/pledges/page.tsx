'use client';

import * as React from 'react';
import {
  Download,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

type DonationItem = {
  id: string;
  recordCategory?: string;
  donor?: {
    firstName?: string;
    lastName?: string;
  };
  amount: number;
  donationDate: string;
  donationFrequency?: string;
  createdAt?: string;
};

type PledgeItem = {
  id: string;
  donor: string;
  totalPledge: number;
  fulfilled: number;
  frequency: string;
  dateRange: string;
};

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Única vez',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const getProgressColor = (progress: number) => {
  if (progress < 25) return 'bg-red-500';
  if (progress < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function PledgeManagementPage() {
  const [pledges, setPledges] = React.useState<PledgeItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/donations')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.donations && Array.isArray(data.donations)) {
          // Show only pledges (recordCategory === 'pledges')
          const pledgeDocs = data.donations.filter(
            (d: DonationItem) => d.recordCategory === 'pledges'
          );

          const mapped: PledgeItem[] = pledgeDocs.map((d: DonationItem) => {
            const donorName = d.donor
              ? `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim()
              : 'Donante Anónimo';
            const dateStr = d.donationDate
              ? new Date(d.donationDate).toLocaleDateString('es-ES', {
                  month: 'short',
                  year: 'numeric',
                })
              : '—';

            return {
              id: d.id,
              donor: donorName || 'Donante Anónimo',
              totalPledge: Number(d.amount) || 0,
              fulfilled: Number(d.amount) || 0,
              frequency: FREQUENCY_LABELS[d.donationFrequency || 'once'] || 'Única vez',
              dateRange: dateStr,
            };
          });

          setPledges(mapped);
        }
      })
      .catch((err) => console.error('Error fetching pledges:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPledges = React.useMemo(() => {
    return pledges.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        if (!p.donor.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all') {
        const pct = p.totalPledge > 0 ? (p.fulfilled / p.totalPledge) * 100 : 0;
        if (statusFilter === 'completed' && pct < 100) return false;
        if (statusFilter === 'on-track' && (pct < 50 || pct >= 100)) return false;
        if (statusFilter === 'behind' && pct >= 50) return false;
      }
      return true;
    });
  }, [pledges, search, statusFilter]);

  const totalPledged = React.useMemo(
    () => pledges.reduce((acc, curr) => acc + curr.totalPledge, 0),
    [pledges]
  );
  const totalFulfilled = React.useMemo(
    () => pledges.reduce((acc, curr) => acc + curr.fulfilled, 0),
    [pledges]
  );
  const completionRate = React.useMemo(
    () => (totalPledged > 0 ? Math.round((totalFulfilled / totalPledged) * 100) : 0),
    [totalFulfilled, totalPledged]
  );
  const pendingPledges = React.useMemo(
    () => Math.max(0, totalPledged - totalFulfilled),
    [totalPledged, totalFulfilled]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPledges.length / itemsPerPage));
  const paginatedData = React.useMemo(
    () => filteredPledges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredPledges, currentPage, itemsPerPage]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Gestión de Promesas"
        description="Rastree y gestione todas las promesas de los miembros y su estado de cumplimiento."
      >
        <Button asChild>
          <Link href="/donations/new">
            <Plus className="mr-2 h-4 w-4" /> Registrar Nueva Promesa
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Prometido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalPledged)}</div>
              <p className="text-xs text-muted-foreground">En {pledges.length} registros</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Cumplimiento General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completionRate}%</div>
              <p className="text-xs text-green-600">Calculado en base a datos reales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Promesas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(pendingPledges)}</div>
              <p className="text-xs text-muted-foreground">Monto total por cubrir</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por donante..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Estado: Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="on-track">En curso</SelectItem>
                    <SelectItem value="behind">Atrasado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="w-auto px-2 sm:px-0 sm:w-auto">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No hay promesas registradas en la base de datos.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>DONANTE</TableHead>
                        <TableHead>PROMESA TOTAL</TableHead>
                        <TableHead className="hidden sm:table-cell">CUMPLIDO</TableHead>
                        <TableHead>PROGRESO</TableHead>
                        <TableHead className="hidden md:table-cell">FRECUENCIA</TableHead>
                        <TableHead className="hidden md:table-cell">RANGO DE FECHAS</TableHead>
                        <TableHead className="text-right">DETALLES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((pledge) => {
                        const progress =
                          pledge.totalPledge > 0
                            ? (pledge.fulfilled / pledge.totalPledge) * 100
                            : 0;
                        return (
                          <TableRow key={pledge.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">
                              {pledge.donor}
                              <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                                Cumplido: {formatCurrency(pledge.fulfilled)} · {pledge.frequency} · {pledge.dateRange}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(pledge.totalPledge)}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {formatCurrency(pledge.fulfilled)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={progress}
                                  className="w-24 [&>div]:bg-green-500"
                                  indicatorClassName={getProgressColor(progress)}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {pledge.frequency}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {pledge.dateRange}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="link" asChild>
                                <Link href={`/donations/${pledge.id}`}>Detalles</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando{' '}
                    {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
                    {Math.min(currentPage * itemsPerPage, filteredPledges.length)} de{' '}
                    {filteredPledges.length} resultados
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i} className="hidden sm:block">
                          <PaginationLink
                            href="#"
                            isActive={i + 1 === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
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
                            handlePageChange(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
