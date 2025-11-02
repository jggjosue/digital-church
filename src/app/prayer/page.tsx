'use client';

import * as React from 'react';
import {
  Search,
  Lock,
  Globe,
  Plus,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { prayerRequestsData } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

const statusColors: { [key: string]: string } = {
  Activo: 'bg-blue-100 text-blue-800 border-blue-200',
  Respondido: 'bg-green-100 text-green-800 border-green-200',
};

const privacyIcons: { [key: string]: React.ReactNode } = {
    Público: <Globe className="h-4 w-4 text-muted-foreground" />,
    'Solo Personal': <Lock className="h-4 w-4 text-muted-foreground" />,
  };

export default function PrayerRequestsPage() {
  
  return (
    <main className="flex-1 bg-muted/20 flex">
      <aside className="w-80 border-r bg-background p-6 hidden md:block">
        <h2 className="text-xl font-bold">Filtros</h2>
        <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="active" />
                        <Label htmlFor="active" className="text-sm">Activo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="answered" />
                        <Label htmlFor="answered" className="text-sm">Respondido</Label>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Privacidad</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="public" />
                        <Label htmlFor="public" className="text-sm">Público</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="staff-only" />
                        <Label htmlFor="staff-only" className="text-sm">Solo Personal</Label>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-sm font-medium text-muted-foreground">Grupo de Oración</h3>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los Grupos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Grupos</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 pt-4">
                <Button className="w-full">Aplicar Filtros</Button>
                <Button variant="ghost" className="w-full">Limpiar Todo</Button>
            </div>
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Peticiones de Oración</h1>
                <p className="text-muted-foreground">
                    Gestione las peticiones de oración y los informes de alabanza.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Users className="mr-2 h-4 w-4" /> Gestionar Grupos</Button>
                <Button><Plus className="mr-2 h-4 w-4" /> Nueva Petición de Oración</Button>
            </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <Tabs defaultValue="all-requests">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar peticiones o nombres..." className="pl-9" />
                    </div>
                    <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                        <TabsTrigger value="all-requests">Todas las Peticiones</TabsTrigger>
                        <TabsTrigger value="my-requests">Mis Peticiones</TabsTrigger>
                        <TabsTrigger value="answered">Respondidas</TabsTrigger>
                    </TabsList>
                </div>
              <TabsContent value="all-requests">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"><Checkbox /></TableHead>
                        <TableHead>PETICIÓN</TableHead>
                        <TableHead>ENVIADO POR</TableHead>
                        <TableHead>FECHA</TableHead>
                        <TableHead>ESTADO</TableHead>
                        <TableHead>PRIVACIDAD</TableHead>
                        <TableHead className="text-right">ACCIONES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prayerRequestsData.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground">{request.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={request.submittedByAvatar} alt={request.submittedBy} />
                                    <AvatarFallback>{request.submittedBy.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{request.submittedBy}</span>
                            </div>
                          </TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {privacyIcons[request.privacy as keyof typeof privacyIcons]}
                                <span>{request.privacy}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="link" className="text-primary">Detalles</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
