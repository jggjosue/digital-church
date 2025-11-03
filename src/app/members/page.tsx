'use client';

import * as React from 'react';
import {
  FileUp,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { membersData } from '@/lib/data';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


type Member = (typeof membersData)[0];

const statusColors = {
  Activo: 'bg-green-500',
  Visitante: 'bg-yellow-500',
  Inactivo: 'bg-red-500',
};

const groupColors = {
  Voluntarios: 'bg-blue-100 text-blue-800',
  Coro: 'bg-yellow-100 text-yellow-800',
  'Grupo de Jóvenes': 'bg-purple-100 text-purple-800',
  'Nuevo Miembro': 'bg-green-100 text-green-800',
};

const allGroups = [...new Set(membersData.flatMap(m => m.groups))];


function Filters({ filters, onFilterChange, onApply, onClear }: { filters: any, onFilterChange: any, onApply: any, onClear: any }) {
    const handleStatusChange = (status: string, checked: boolean) => {
        const newStatus = checked
            ? [...filters.status, status]
            : filters.status.filter((s: string) => s !== status);
        onFilterChange('status', newStatus);
    };

    return (
        <>
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                Estado de Membresía
                </h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="active" onCheckedChange={(checked) => handleStatusChange('Activo', !!checked)} checked={filters.status.includes('Activo')} />
                        <Label htmlFor="active" className="text-sm">Activo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="visitor" onCheckedChange={(checked) => handleStatusChange('Visitante', !!checked)} checked={filters.status.includes('Visitante')} />
                        <Label htmlFor="visitor" className="text-sm">Visitante</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="inactive" onCheckedChange={(checked) => handleStatusChange('Inactivo', !!checked)} checked={filters.status.includes('Inactivo')} />
                        <Label htmlFor="inactive" className="text-sm">Inactivo</Label>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                Grupos
                </h3>
                <Select value={filters.group} onValueChange={(value) => onFilterChange('group', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los Grupos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Grupos</SelectItem>
                        {allGroups.map(group => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Etiquetas</h3>
                <Input placeholder="Ej. Bautizado, Nuevo" value={filters.tags} onChange={(e) => onFilterChange('tags', e.target.value)} />
            </div>
            </div>
            <div className="mt-8 space-y-2">
                <Button className="w-full" onClick={onApply}>Aplicar Filtros</Button>
                <Button variant="ghost" className="w-full" onClick={onClear}>Limpiar Todo</Button>
            </div>
        </>
    )
}

export default function MembersPage() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [view, setView] = React.useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState({
    status: [] as string[],
    group: 'all',
    tags: ''
  });
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>(membersData);
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null);
  const [isBulkDelete, setIsBulkDelete] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const applyFilters = React.useCallback(() => {
    let data = membersData;

    // Search term filter
    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        data = data.filter(member => 
            member.name.toLowerCase().includes(lowercasedFilter) ||
            member.email.toLowerCase().includes(lowercasedFilter) ||
            (member.phone1 && member.phone1.toLowerCase().includes(lowercasedFilter)) ||
            member.status.toLowerCase().includes(lowercasedFilter)
        );
    }

    // Status filter
    if (filters.status.length > 0) {
        data = data.filter(member => filters.status.includes(member.status));
    }

    // Group filter
    if (filters.group !== 'all') {
        data = data.filter(member => member.groups.includes(filters.group));
    }

    setFilteredMembers(data);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filters]);


  const clearFilters = () => {
    setFilters({
        status: [],
        group: 'all',
        tags: ''
    });
    setSearchTerm('');
    setFilteredMembers(membersData);
    setCurrentPage(1);
  };
  
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, applyFilters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(paginatedMembers.map((m) => m.id));
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

  const handleDelete = () => {
    if (isBulkDelete) {
        setFilteredMembers(prev => prev.filter(m => !selected.includes(m.id)));
        setSelected([]);
    } else if (memberToDelete) {
        setFilteredMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
        setSelected(prev => prev.filter(id => id !== memberToDelete.id));
    }
    setMemberToDelete(null);
    setIsBulkDelete(false);
  };

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <AlertDialog>
        <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1 md:grid md:grid-cols-[280px_1fr]">
            <aside className="w-full shrink-0 md:w-80 border-b md:border-r md:border-b-0 bg-background p-6 hidden md:block">
                <Filters filters={filters} onFilterChange={handleFilterChange} onApply={applyFilters} onClear={clearFilters}/>
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="sticky top-0 z-10 flex h-auto flex-col items-start gap-4 border-b bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:h-auto">
                    <div className='flex-1'>
                        <h1 className="text-3xl font-bold">Directorio de Miembros</h1>
                        <p className="text-muted-foreground">
                        Administre perfiles de miembros, información de contacto y membresías de grupos.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button asChild>
                            <Link href="/members/new"><Plus className="mr-2" /> Añadir Nuevo Miembro</Link>
                        </Button>
                        <ThemeToggle />
                    </div>
                </header>
                <div className='flex-1 flex flex-col p-4 sm:p-8'>
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre, email, teléfono, estado..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-between gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden flex items-center gap-2">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span>Filtros</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px]">
                                <div className="p-6">
                                    <Filters filters={filters} onFilterChange={handleFilterChange} onApply={applyFilters} onClear={clearFilters}/>
                                </div>
                                </SheetContent>
                            </Sheet>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={view === 'table' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setView('table')}
                                >
                                    <List className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant={view === 'card' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setView('card')}
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                    {selected.length > 0 && (
                        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg bg-blue-50 p-3 gap-2">
                        <div className="text-sm font-medium">
                            {selected.length} {selected.length > 1 ? 'elementos seleccionados' : 'elemento seleccionado'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/members/send-email?ids=${selected.join(',')}`}><Mail className="h-4 w-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            
                            </Button>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => setIsBulkDelete(true)}>
                                    Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <Button size="sm" asChild>
                            <Link href="/members/bulk-actions">Acciones Masivas</Link>
                            </Button>
                        </div>
                        </div>
                    )}
                    
                    {filteredMembers.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            No se encontraron miembros que coincidan con sus filtros.
                        </div>
                    )}

                    {view === 'table' && filteredMembers.length > 0 ? (
                        <div className="overflow-x-auto flex-1">
                        <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                            <Checkbox
                                checked={
                                selected.length > 0 &&
                                selected.length === paginatedMembers.length
                                }
                                onCheckedChange={(checked) =>
                                handleSelectAll(!!checked)
                                }
                            />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Grupos</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {paginatedMembers.map((member) => (
                            <TableRow key={member.id}>
                            <TableCell>
                                <Checkbox
                                checked={selected.includes(member.id)}
                                onCheckedChange={(checked) =>
                                    handleSelectOne(member.id, !!checked)
                                }
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage
                                    src={`https://picsum.photos/seed/${member.id}/40/40`}
                                    alt={member.name}
                                    />
                                    <AvatarFallback>
                                    {member.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                    {member.email}
                                    </div>
                                </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{member.phone1}</div>
                                <div className="text-sm text-muted-foreground">
                                {member.phone2}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                    statusColors[member.status as keyof typeof statusColors]
                                    }`}
                                />
                                <span className="text-sm">{member.status}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                {member.groups.map((group) => (
                                    <Badge
                                    key={group}
                                    variant="outline"
                                    className={`font-normal ${groupColors[group as keyof typeof groupColors] || 'bg-gray-100 text-gray-800'}`}
                                    >
                                    {group}
                                    </Badge>
                                ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                <Button variant="link" asChild>
                                    <Link href={`/members/${member.id}`}>Ver</Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                    <DropdownMenuItem asChild><Link href={`/members/${member.id}/edit`}>Editar</Link></DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => {e.preventDefault(); setIsBulkDelete(false); setMemberToDelete(member);}}>Eliminar</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                    ) : view === 'card' && filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 flex-1">
                        {paginatedMembers.map((member) => (
                        <Card key={member.id} className="relative flex flex-col">
                            <Checkbox
                                checked={selected.includes(member.id)}
                                onCheckedChange={(checked) =>
                                    handleSelectOne(member.id, !!checked)
                                }
                                className="absolute top-4 left-4"
                                />
                            <CardHeader className="flex flex-row items-start justify-end p-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                    <DropdownMenuItem asChild><Link href={`/members/${member.id}/edit`}>Editar</Link></DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => {e.preventDefault(); setIsBulkDelete(false); setMemberToDelete(member);}}>Eliminar</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <Link href={`/members/${member.id}`} className="flex flex-col items-center justify-center flex-1 text-center p-4 pt-0">
                                <Avatar className="h-20 w-20 mb-4">
                                    <AvatarImage src={`https://picsum.photos/seed/${member.id}/80/80`} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-lg font-bold">{member.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${statusColors[member.status as keyof typeof statusColors]}`} />
                                    <span className="text-sm font-medium">{member.status}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1 justify-center">
                                    {member.groups.map((group) => (
                                    <Badge key={group} variant="outline" className={`font-normal ${groupColors[group as keyof typeof groupColors] || 'bg-gray-100 text-gray-800'}`}>{group}</Badge>
                                    ))}
                                </div>
                            </Link>
                        </Card>
                        ))}
                    </div>
                    ) : null}
                     <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {paginatedMembers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredMembers.length)} de {filteredMembers.length} resultados
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
                </div>
            </main>
        </div>
        </div>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    {isBulkDelete 
                        ? `Esta acción no se puede deshacer. Esto eliminará permanentemente a los ${selected.length} miembros seleccionados.`
                        : `Esta acción no se puede deshacer. Esto eliminará permanentemente al miembro ${memberToDelete?.name} y eliminará sus datos de nuestros servidores.`
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {setMemberToDelete(null); setIsBulkDelete(false)}}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}

    