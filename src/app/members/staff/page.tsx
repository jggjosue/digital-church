
'use client';

import * as React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Plus,
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

type StaffMember = (typeof staffData)[0];


export default function StaffDirectoryPage() {
    const [view, setView] = React.useState<'list' | 'grid'>('grid');

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
        </aside>
        <div className="flex-1 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, rol o contacto..." className="pl-9" />
                </div>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Ver como:</span>
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}>
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                     <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                        <List className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {staffData.map((staff) => (
                    <Card key={staff.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <Avatar className='h-24 w-24'>
                                    <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                                    <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-center">
                                    <h3 className="text-xl font-bold">{staff.name}</h3>
                                    <p className="text-primary">{staff.role}</p>
                                    <div className='mt-4 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm text-muted-foreground justify-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <Mail className='h-4 w-4'/>
                                            <span>{staff.email}</span>
                                        </div>
                                         <div className='flex items-center justify-center gap-2'>
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
        </div>
      </main>
    </div>
  );
}
