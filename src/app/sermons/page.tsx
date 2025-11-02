'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sermonsData } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type Sermon = (typeof sermonsData)[0];

const statusColors: { [key: string]: string } = {
    Publicado: 'bg-green-100 text-green-800 border-green-200',
    Programado: 'bg-blue-100 text-blue-800 border-blue-200',
    Borrador: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Archivado: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function SermonsPage() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(sermonsData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedData = sermonsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(paginatedData.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Sermones y Medios</h1>
          <p className="text-muted-foreground">
            Gestione todos los sermones, videos, audios e imágenes de su iglesia.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Sermón
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <Tabs defaultValue="all-media">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por título o predicador..." className="pl-9" />
                </div>
                <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline">Estado <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline">Serie <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline">Predicador <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline">Fechas <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>
            <TabsList className="grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="all-media">Todos los Medios</TabsTrigger>
              <TabsTrigger value="sermons">Sermones</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
            </TabsList>
            <TabsContent value="all-media">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selected.length > 0 &&
                          selected.length === paginatedData.length
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead>TÍTULO</TableHead>
                    <TableHead>PREDICADOR</TableHead>
                    <TableHead>SERIE</TableHead>
                    <TableHead>FECHA</TableHead>
                    <TableHead>ESTADO</TableHead>
                    <TableHead className="text-right">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((sermon) => (
                    <TableRow key={sermon.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(sermon.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(sermon.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sermon.title}</TableCell>
                      <TableCell>{sermon.speaker}</TableCell>
                      <TableCell>{sermon.series}</TableCell>
                      <TableCell>{sermon.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[sermon.status as keyof typeof statusColors]}
                        >
                          {sermon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Ver</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
               <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, sermonsData.length)} de {sermonsData.length} resultados
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
