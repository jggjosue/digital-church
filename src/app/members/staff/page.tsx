
'use client';

import * as React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { staffData } from '@/lib/data';
import { AppHeader } from '@/components/app-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

type StaffMember = (typeof staffData)[0];


export default function StaffDirectoryPage() {
    const [view, setView] = React.useState<'list' | 'grid'>('grid');

    const Filters = () => (
        <>
            <h2 className="text-xl font-semibold">Filtros</h2>
            <div className="mt-6 space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Rol / Posición
                    </h3>
                    <Select>
                        <SelectTrigger className='mt-2'>
                            <SelectValue placeholder="Todos los Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Roles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Departamento
                    </h3>
                    <Select>
                        <SelectTrigger className='mt-2'>
                            <SelectValue placeholder="Todos los Departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Departamentos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Estado
                    </h3>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox id="active" defaultChecked />
                            <Label htmlFor="active" className="text-sm font-normal">Activo</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="inactive" />
                            <Label htmlFor="inactive" className="text-sm font-normal">Inactivo</Label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Directorio de Personal"
        description="Gestione pastores, colaboradores y miembros del personal."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Miembro del Personal
        </Button>
      </AppHeader>
      <main className="flex flex-1 bg-muted/20">
        <aside className="hidden w-80 border-r bg-background p-6 lg:block">
            <Filters />
        </aside>
        <div className="flex-1 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, rol o contacto..." className="pl-9" />
                </div>
                <div className='flex items-center gap-2 self-end sm:self-center'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filtros</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px]">
                            <div className="p-6">
                                <Filters />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className='hidden sm:inline-block text-sm text-muted-foreground'>Ver como:</span>
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}>
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                     <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {staffData.map((staff) => (
                        <Card key={staff.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <Avatar className='h-24 w-24'>
                                        <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-center">
                                        <h3 className="text-xl font-bold">{staff.name}</h3>
                                        <p className="text-primary">{staff.role}</p>
                                        <div className='mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground'>
                                            <div className='flex items-center gap-2'>
                                                <Mail className='h-4 w-4'/>
                                                <span>{staff.email}</span>
                                            </div>
                                             <div className='flex items-center gap-2'>
                                                <Phone className='h-4 w-4'/>
                                                <span>{staff.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                                        <Link href="#">Ver Perfil</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className='p-0'>
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead className='text-right'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffData.map((staff) => (
                                        <TableRow key={staff.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className='h-10 w-10'>
                                                        <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                                                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span className='font-medium'>{staff.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-primary'>{staff.role}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                    <Mail className='h-4 w-4'/>
                                                    <span>{staff.email}</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                                                    <Phone className='h-4 w-4'/>
                                                    <span>{staff.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Button variant="outline" asChild>
                                                    <Link href="#">Ver Perfil</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}
