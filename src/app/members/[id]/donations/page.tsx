
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  FileText,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { memberDonationHistory } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { AppHeader } from '@/components/app-header';


export default function MemberDonationHistoryPage({ params }: { params: { id: string } }) {
    const memberRecords = memberDonationHistory;
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
  
    const totalPages = Math.ceil(memberRecords.length / itemsPerPage);
  
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    const paginatedData = memberRecords.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Historial de Donaciones de John Doe"
        description="Vea el historial completo de donaciones para este miembro."
      >
        <div className='flex gap-2'>
            <Button variant='outline'><FileText className='h-4 w-4 mr-2' />Generar Estado de Cuenta</Button>
            <Button><Download className='h-4 w-4 mr-2' />Exportar</Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardHeader>
            <CardTitle>Todas las Donaciones</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por fondo o tipo..." className="pl-9" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                  <Select>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Filtrar por fondo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Fondos</SelectItem>
                      <SelectItem value="general">Fondo General</SelectItem>
                      <SelectItem value="construction">Campaña de Construcción</SelectItem>
                      <SelectItem value="missions">Fondo de Misiones</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Rango de Fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el Tiempo</SelectItem>
                      <SelectItem value="this-year">Este Año</SelectItem>
                      <SelectItem value="last-year">Año Pasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'><Checkbox /></TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Fondo</TableHead>
                <TableHead>Tipo de Pago</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric'})}</TableCell>
                  <TableCell>{record.fund}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell className="text-right font-medium">${record.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, memberRecords.length)} de {memberRecords.length} resultados
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
    </main>
    </div>
  );
}
