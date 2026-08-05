'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

const statusColors: { [key: string]: string } = {
    published: 'bg-green-100 text-green-800 border-green-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusMap: { [key: string]: string } = {
    published: 'Publicado',
    draft: 'Borrador',
    archived: 'Archivado'
};

export default function SermonsPage() {
  const [sermonsData, setSermonsData] = React.useState<Sermon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [sermonToDelete, setSermonToDelete] = React.useState<Sermon | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchSermons = async () => {
    try {
        const res = await fetch('/api/data/sermons');
        const data = await res.json();
        if (data.items) {
            setSermonsData(data.items);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  React.useEffect(() => {
      fetchSermons();
  }, []);

  const totalPages = Math.max(1, Math.ceil(sermonsData.length / itemsPerPage));

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

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };
  
  const handleDeleteSermon = async () => {
    if (sermonToDelete) {
      setIsDeleting(true);
      try {
        await fetch(`/api/data/sermons/${sermonToDelete.id}`, { method: 'DELETE' });
        setSermonsData(prev => prev.filter(s => s.id !== sermonToDelete.id));
      } catch (e) {
          console.error(e);
      } finally {
        setIsDeleting(false);
        setSermonToDelete(null);
      }
    }
  };

  return (
    <AlertDialog open={!!sermonToDelete} onOpenChange={(open) => !open && setSermonToDelete(null)}>
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Biblioteca de Sermones y Medios"
        description="Gestione todos los sermones, videos, audios e imágenes de su iglesia."
      >
        <Button asChild>
          <Link href="/sermons/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Sermón
          </Link>
        </Button>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="all-media">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por título o predicador..." className="pl-9" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline" className="w-full">Estado <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Serie <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Predicador <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Fechas <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>
            <TabsList className="grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="all-media">Todos los Medios</TabsTrigger>
              <TabsTrigger value="sermons">Sermones</TabsTrigger>
              <TabsTrigger value="videos" asChild><Link href="/sermons/videos">Videos</Link></TabsTrigger>
              <TabsTrigger value="audio" asChild><Link href="/sermons/audio">Audio</Link></TabsTrigger>
              <TabsTrigger value="images" asChild><Link href="/sermons/images">Imágenes</Link></TabsTrigger>
            </TabsList>
            <TabsContent value="all-media">
                <div className="overflow-x-auto min-h-[300px]">
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
                      <TableCell>{new Date(sermon.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[sermon.status] || ''}
                        >
                          {statusMap[sermon.status] || sermon.status}
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
                            <DropdownMenuItem className="text-destructive" onClick={() => setSermonToDelete(sermon)}>
                            Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
            <TabsContent value="sermons">
                <p className="py-4 text-muted-foreground">Ver la lista detallada de sermones en <Link href="/sermons/list" className="text-primary underline">vista de lista</Link>.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>

    <AlertDialogContent>
        <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Eliminar Sermón</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
                ¿Estás seguro de que quieres eliminar el sermón <span className="font-bold">&quot;{sermonToDelete?.title}&quot;</span>? Esta acción es permanente y no se puede deshacer.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={() => setSermonToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSermon} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Eliminación'}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
    </div>
    </AlertDialog>
  );
}