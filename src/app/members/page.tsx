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
  CardTitle,
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

export default function MembersPage() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [view, setView] = React.useState<'table' | 'card'>('table');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(membersData.map((m) => m.id));
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
    <div className="flex min-h-screen w-full">
      <aside className="w-80 border-r bg-background p-6">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Estado de Membresía
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="active" />
                <label htmlFor="active" className="text-sm">
                  Activo
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="visitor" />
                <label htmlFor="visitor" className="text-sm">
                  Visitante
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="inactive" />
                <label htmlFor="inactive" className="text-sm">
                  Inactivo
                </label>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Grupos
            </h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los Grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Grupos</SelectItem>
                <SelectItem value="volunteers">Voluntarios</SelectItem>
                <SelectItem value="choir">Coro</SelectItem>
                <SelectItem value="youth">Grupo de Jóvenes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Etiquetas</h3>
            <Input placeholder="Ej. Bautizado, Nuevo" />
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <Button className="w-full">Aplicar Filtros</Button>
          <Button variant="ghost" className="w-full">
            Limpiar Todo
          </Button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-8">
            <div>
                <h1 className="text-3xl font-bold">Directorio de Miembros</h1>
                <p className="text-muted-foreground">
                Administre perfiles de miembros, información de contacto y membresías de grupos.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Button>
                    <Plus className="mr-2" /> Añadir Nuevo Miembro
                </Button>
                <ThemeToggle />
            </div>
        </header>
        <div className='p-8'>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre, email o teléfono..." className="pl-9" />
                </div>
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
            </CardHeader>
            <CardContent>
              {selected.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
                  <div className="text-sm font-medium">
                    {selected.length} {selected.length > 1 ? 'elementos seleccionados' : 'elemento seleccionado'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <div className="ml-4">
                      <Button size="sm">
                        Acciones Masivas
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {view === 'table' ? (
                 <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-12">
                       <Checkbox
                         checked={
                           selected.length > 0 &&
                           selected.length === membersData.length
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
                   {membersData.map((member) => (
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
                           <Button variant="link">Ver</Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon">
                                 <MoreHorizontal className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent>
                               <DropdownMenuItem>Editar</DropdownMenuItem>
                               <DropdownMenuItem>Eliminar</DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {membersData.map((member) => (
                    <Card key={member.id} className="relative">
                       <Checkbox
                           checked={selected.includes(member.id)}
                           onCheckedChange={(checked) =>
                             handleSelectOne(member.id, !!checked)
                           }
                           className="absolute top-4 left-4"
                         />
                      <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12">
                             <AvatarImage src={`https://picsum.photos/seed/${member.id}/48/48`} alt={member.name} />
                             <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                             <CardTitle className="text-base">{member.name}</CardTitle>
                             <p className="text-sm text-muted-foreground">{member.email}</p>
                           </div>
                         </div>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent>
                             <DropdownMenuItem>Editar</DropdownMenuItem>
                             <DropdownMenuItem>Eliminar</DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                         <div className="text-sm">{member.phone1}</div>
                         <div className="flex items-center gap-2">
                           <span className={`h-2 w-2 rounded-full ${statusColors[member.status as keyof typeof statusColors]}`} />
                           <span className="text-sm">{member.status}</span>
                         </div>
                         <div className="flex flex-wrap gap-1 pt-2">
                           {member.groups.map((group) => (
                             <Badge key={group} variant="outline" className={`font-normal ${groupColors[group as keyof typeof groupColors] || 'bg-gray-100 text-gray-800'}`}>{group}</Badge>
                           ))}
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
