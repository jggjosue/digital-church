
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Upload,
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
import { sermonsData as initialSermonsData } from '@/lib/data';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type Sermon = (typeof initialSermonsData)[0];

const statusColors: { [key: string]: string } = {
    Publicado: 'bg-green-100 text-green-800 border-green-200',
    Programado: 'bg-blue-100 text-blue-800 border-blue-200',
    Borrador: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Archivado: 'bg-gray-100 text-gray-800 border-gray-200',
};

const audioLibraryData: Sermon[] = [
    ...initialSermonsData.slice(0, 3),
    {
        id: 100,
        title: 'Podcast Ep. 12: Community',
        speaker: 'Host Alice & Bob',
        series: 'Church Life Podcast',
        date: 'Nov 01, 2023',
        status: 'Publicado',
        duration: '25:30',
    },
    initialSermonsData[3],
];


export default function AudioLibraryPage() {
  const [sermonsData, setSermonsData] = React.useState<Sermon[]>(audioLibraryData);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [sermonToDelete, setSermonToDelete] = React.useState<Sermon | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

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
  
  const handleDeleteSermon = () => {
    if (sermonToDelete) {
      setSermonsData(prev => prev.filter(s => s.id !== sermonToDelete.id));
      setSermonToDelete(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Audio Library"
        description="Manage sermon audio, podcasts, and other audio content."
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Audio
        </Button>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="audio">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title, speaker, or event..." className="pl-9" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline" className="w-full">Filter by Status <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Filter by Category <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Date Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>
            <TabsList className="grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="all-media" asChild><Link href="/sermons">All Media</Link></TabsTrigger>
              <TabsTrigger value="sermons" asChild><Link href="/sermons/list">Sermons</Link></TabsTrigger>
              <TabsTrigger value="videos" asChild><Link href="/sermons/videos">Videos</Link></TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="images" asChild><Link href="/sermons/images">Images</Link></TabsTrigger>
            </TabsList>
            <TabsContent value="audio">
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
                    <TableHead>TITLE</TableHead>
                    <TableHead>SPEAKER</TableHead>
                    <TableHead>SERMON/EVENT</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>DURATION</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
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
                      <TableCell>{sermon.date.replace(', 2023', '')}<br/>2023</TableCell>
                      <TableCell>{sermon.duration}</TableCell>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()} onClick={() => setSermonToDelete(sermon)}>
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
    </div>
  );
}
