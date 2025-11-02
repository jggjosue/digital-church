'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Trash2,
  Edit,
  UserPlus,
  ChevronDown,
  BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { attendanceRecords } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Link from 'next/link';

const statusColors: { [key: string]: string } = {
    Presente: 'bg-green-100 text-green-800 border-green-200',
    Ausente: 'bg-gray-100 text-gray-800 border-gray-200',
    Justificado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusDotColors: { [key: string]: string } = {
    Presente: 'bg-green-500',
    Ausente: 'bg-gray-400',
    Justificado: 'bg-yellow-500',
};


export default function AttendancePage() {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
  
    const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    const paginatedData = attendanceRecords.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Asistencia</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild><Link href="/reports"><BarChart className="mr-2 h-4 w-4" /> Generar Reporte</Link></Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Registrar Nueva Asistencia</Button>
        </div>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre de miembro..." className="pl-9" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                  <Select>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Servicio/Evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Servicios/Eventos</SelectItem>
                      <SelectItem value="sunday">Servicio Dominical</SelectItem>
                      <SelectItem value="youth">Reunión de Jóvenes</SelectItem>
                      <SelectItem value="bible-study">Estudio Bíblico Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Grupo Ministerial" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Grupos</SelectItem>
                      <SelectItem value="youth">Grupo de Jóvenes</SelectItem>
                      <SelectItem value="choir">Coro</SelectItem>
                      <SelectItem value="volunteers">Voluntarios</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Rango de Fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="this-week">Esta Semana</SelectItem>
                      <SelectItem value="this-month">Este Mes</SelectItem>
                      <SelectItem value="this-year">Este Año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre del Servicio/Evento</TableHead>
                <TableHead>Nombre del Miembro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Hora de Entrada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.serviceName}</TableCell>
                  <TableCell>{record.memberName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-medium ${statusColors[record.status]}`}>
                        <span className={`h-2 w-2 rounded-full mr-2 ${statusDotColors[record.status]}`}></span>
                        {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.checkInTime}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, attendanceRecords.length)} de {attendanceRecords.length} resultados
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
  );
}
