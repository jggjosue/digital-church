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
  Loader2,
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

type Sermon = {
  id: string;
  title: string;
  speaker: string;
  date: string;
  series?: string;
  scripture?: string;
  description?: string;
  status: string;
};

export default function SermonsListPage() {
  const [sermonsData, setSermonsData] = React.useState<Sermon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const itemsPerPage = 5;

  const fetchSermons = async (page: number) => {
    setLoading(true);
    try {
        const res = await fetch(`/api/data/sermons?page=${page}&limit=${itemsPerPage}`);
        const data = await res.json();
        if (data.items) {
            setSermonsData(data.items);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  React.useEffect(() => {
      fetchSermons(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(sermonsData.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  const handleDelete = async (id: string) => {
      try {
          await fetch(`/api/data/sermons/${id}`, { method: 'DELETE' });
          setSermonsData(prev => prev.filter(s => s.id !== id));
      } catch (e) {
          console.error(e);
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
              <div className="overflow-x-auto min-h-[250px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full pt-10">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selected.length > 0 &&
                            selected.length === sermonsData.length
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
                    {sermonsData.map((sermon, idx) => (
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
                          <div className="text-sm text-muted-foreground">Series: {sermon.series || 'N/A'}</div>
                        </TableCell>
                        <TableCell>{sermon.speaker}</TableCell>
                        <TableCell>{new Date(sermon.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {idx % 2 === 0 ? <Video className="h-4 w-4 text-muted-foreground" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sermon.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sermonsData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No hay sermones registrados
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {sermonsData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
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
