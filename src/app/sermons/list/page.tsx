
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Eye,
  Edit,
  Video,
  Mic,
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
import { sermonsData } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

type Sermon = (typeof sermonsData)[0];

const sermons = sermonsData;

export default function SermonsListPage() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sermons.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedData = sermons.slice(
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
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Sermones"
        description="Vea y gestione todos los sermones de su iglesia."
      >
        <Button asChild>
          <Link href="/sermons/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Sermón
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                  <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por título, predicador o tema..." className="pl-9" />
                  </div>
                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                      <Button variant="outline">Predicador <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Serie <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Tema <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Rango de Fechas <ChevronDown className="ml-2 h-4 w-4" /></Button>
                  </div>
              </div>
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
                      <TableHead>FECHA</TableHead>
                      <TableHead>MEDIA</TableHead>
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
                        <TableCell>
                          <div className="font-medium">{sermon.title}</div>
                          <div className="text-sm text-muted-foreground">Series: {sermon.series}</div>
                        </TableCell>
                        <TableCell>{sermon.speaker}</TableCell>
                        <TableCell>{sermon.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {sermon.id % 2 === 0 && <Video className="h-4 w-4 text-muted-foreground" />}
                            {sermon.id % 2 !== 0 && <Mic className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, sermons.length)} de {sermons.length} resultados
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
