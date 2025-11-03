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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupData, groupMembers } from '@/lib/data';
import Link from 'next/link';

type Group = (typeof groupData)[0];
type GroupMember = (typeof groupMembers)[0];

const statusColors: { [key: string]: string } = {
  Activo: 'bg-green-100 text-green-800 border-green-200',
  'En Pausa': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Inactivo: 'bg-red-100 text-red-800 border-red-200',
};

const roleColors: { [key: string]: string } = {
    Líder: 'bg-blue-100 text-blue-800 border-blue-200',
    Miembro: 'bg-gray-100 text-gray-800 border-gray-200',
  };

export default function GroupsPage() {
  const [selectedGroup, setSelectedGroup] = React.useState<Group>(
    groupData[0]
  );
  const [selectedMembers, setSelectedMembers] = React.useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(groupMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, id]);
    } else {
      setSelectedMembers(selectedMembers.filter((i) => i !== id));
    }
  };

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Grupos</h1>
          <p className="text-muted-foreground">
            Organice y gestione los grupos de su iglesia y sus miembros.
          </p>
        </div>
        <Button className="mt-4 sm:mt-0" asChild>
          <Link href="/groups/new"><Plus className="mr-2 h-4 w-4" /> Crear Nuevo Grupo</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Group List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold">Todos los Grupos</h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar grupos..." className="pl-9" />
          </div>
          <div className="mt-4 space-y-3">
            {groupData.map((group) => (
              <Card
                key={group.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedGroup.id === group.id ? 'border-primary shadow-md' : ''}`}
                onClick={() => setSelectedGroup(group)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.members} Miembros</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`font-normal whitespace-nowrap ${statusColors[group.status]}`}
                    >
                      {group.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Group Details & Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedGroup.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroup.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Miembros del Grupo ({groupMembers.length})</h2>
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar miembros..."
                  className="pl-9"
                />
              </div>
              <Button asChild>
                <Link href="/groups/add-members"><UserPlus className="mr-2 h-4 w-4" /> Añadir Miembro</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-4">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedMembers.length > 0 &&
                          selectedMembers.length === groupMembers.length
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(member.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://picsum.photos/seed/${member.id + 10}/40/40`}
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
                        <div className="text-sm">{member.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-medium ${roleColors[member.role]}`}>
                            {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" className="text-destructive hover:text-destructive/80">
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
