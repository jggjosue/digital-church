
'use client';

import * as React from 'react';
import {
  FileText,
  Plus,
  Search,
  ListFilter,
  Download,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

const donationsData = [
  {
    id: 1,
    donorName: 'John & Jane Smith',
    date: '28 de Oct, 2023',
    amount: 250.0,
    fund: 'Fondo General',
    paymentMethod: 'Tarjeta de Crédito',
  },
  {
    id: 2,
    donorName: 'David Lee',
    date: '27 de Oct, 2023',
    amount: 1000.0,
    fund: 'Campaña de Construcción',
    paymentMethod: 'Cheque',
  },
  {
    id: 3,
    donorName: 'Maria Garcia',
    date: '25 de Oct, 2023',
    amount: 75.0,
    fund: 'Fondo de Misiones',
    paymentMethod: 'Donación en Línea',
  },
  {
    id: 4,
    donorName: 'Anónimo',
    date: '24 de Oct, 2023',
    amount: 500.0,
    fund: 'Fondo General',
    paymentMethod: 'Efectivo',
  },
  {
    id: 5,
    donorName: 'La Familia Williams',
    date: '22 de Oct, 2023',
    amount: 150.0,
    fund: 'Ministerio Juvenil',
    paymentMethod: 'Transferencia Bancaria',
  },
  // Add more data for pagination
  { id: 6, donorName: 'Chris Green', date: '21 de Oct, 2023', amount: 100.00, fund: 'Fondo General', paymentMethod: 'Tarjeta de Crédito' },
  { id: 7, donorName: 'Patricia Hall', date: '20 de Oct, 2023', amount: 200.00, fund: 'Campaña de Construcción', paymentMethod: 'Cheque' },
  { id: 8, donorName: 'Jennifer Allen', date: '19 de Oct, 2023', amount: 50.00, fund: 'Fondo de Misiones', paymentMethod: 'Donación en Línea' },
  { id: 9, donorName: 'James Young', date: '18 de Oct, 2023', amount: 300.00, fund: 'Fondo General', paymentMethod: 'Efectivo' },
  { id: 10, donorName: 'Linda King', date: '17 de Oct, 2023', amount: 450.00, fund: 'Ministerio Juvenil', paymentMethod: 'Transferencia Bancaria' },
  { id: 11, donorName: 'Richard Wright', date: '16 de Oct, 2023', amount: 50.00, fund: 'Fondo General', paymentMethod: 'Tarjeta de Crédito' },
  { id: 12, donorName: 'Susan Hill', date: '15 de Oct, 2023', amount: 120.00, fund: 'Campaña de Construcción', paymentMethod: 'Cheque' },
];

export default function DonationsPage() {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
    const totalItems = donationsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
    };

    const paginatedData = donationsData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Donaciones y Ofrendas"
        description="Gestione donaciones, promesas de donación y genere estados de cuenta."
      >
        <Button variant="outline" asChild>
          <Link href="/donations/giving-statement">
            <FileText className="mr-2 h-4 w-4" /> Generar Estado de Cuenta
          </Link>
        </Button>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ofrendas Totales Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$15,480.50</div>
            <p className="text-xs text-green-600">+5.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cumplimiento de Promesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">88%</div>
            <p className="text-xs text-red-600">-1.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-green-600">+1</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="donations">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="donations">Donaciones</TabsTrigger>
            <TabsTrigger value="pledges">Promesas</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          </TabsList>
          <TabsContent value="donations">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar donaciones..." className="pl-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button asChild>
                      <Link href="/donations/new">
                        <Plus className="mr-2 h-4 w-4" /> Añadir Donación
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>NOMBRE DEL DONANTE</TableHead>
                      <TableHead>FECHA</TableHead>
                      <TableHead>MONTO</TableHead>
                      <TableHead>FONDO/CAMPAÑA</TableHead>
                      <TableHead>MÉTODO DE PAGO</TableHead>
                      <TableHead className="text-right">ACCIONES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{donation.donorName}</TableCell>
                        <TableCell>{donation.date}</TableCell>
                        <TableCell>${donation.amount.toFixed(2)}</TableCell>
                        <TableCell>{donation.fund}</TableCell>
                        <TableCell>{donation.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" className="text-primary">
                            Ver
                          </Button>
                          <Button variant="link" asChild>
                            <Link href={`/donations/${donation.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                    </div>
                    <Pagination>
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                            <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}>
                                {i + 1}
                            </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}/>
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pledges">
            <div className="p-6 text-center text-muted-foreground">
              La gestión de promesas estará disponible próximamente.
            </div>
          </TabsContent>
          <TabsContent value="campaigns">
            <div className="p-6 text-center text-muted-foreground">
              La gestión de campañas estará disponible próximamente.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </div>
  );
}
