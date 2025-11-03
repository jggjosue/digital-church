'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ministriesData, membersData } from '@/lib/data';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

const statusColors: { [key: string]: string } = {
    Activo: 'bg-green-100 text-green-800 border-green-200',
    Inactivo: 'bg-red-100 text-red-800 border-red-200',
    Visitante: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const roleColors: { [key: string]: string } = {
    Líder: 'bg-blue-100 text-blue-800 border-blue-200',
    Miembro: 'bg-gray-100 text-gray-800 border-gray-200',
  };

export default function MinistryDetailsPage({ params }: { params: { id: string } }) {
  const ministry = ministriesData.find(m => m.id.toString() === params.id);
  
  if (!ministry) {
    notFound();
  }

  // For demo, we'll just grab some members and assign them to the ministry
  const ministryMembers = membersData.slice(0, ministry.members).map((member, index) => ({
      ...member,
      role: ministry.leader === member.name ? 'Líder' : (index === 1 && ministry.leader !== member.name ? 'Líder' : 'Miembro')
  }));

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/ministries"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{ministry.name}</h1>
                <p className="text-muted-foreground">{ministry.description}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild><Link href={`/ministries/${ministry.id}/edit`}><Edit className="mr-2 h-4 w-4" />Editar Ministerio</Link></Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Añadir Miembros</Button>
        </div>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Miembros del Ministerio ({ministryMembers.length})</CardTitle>
            <CardDescription>
                La siguiente es una lista de todos los miembros en el ministerio de {ministry.name}.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o email..." className="pl-9" />
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>NOMBRE</TableHead>
                            <TableHead>CONTACTO</TableHead>
                            <TableHead>ROL</TableHead>
                            <TableHead>ESTADO DEL MIEMBRO</TableHead>
                            <TableHead className="text-right">ACCIONES</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ministryMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://picsum.photos/seed/${member.id}/40/40`} alt={member.name} />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{member.phone1}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={roleColors[member.role as keyof typeof roleColors]}>
                                        {member.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusColors[member.status as keyof typeof statusColors]}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
