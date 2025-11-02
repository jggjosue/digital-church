'use client';

import * as React from 'react';
import {
  Search,
  Edit,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { volunteersData } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

type Volunteer = (typeof volunteersData)[0];

export default function VolunteersPage() {
  const [selectedVolunteer, setSelectedVolunteer] = React.useState<Volunteer>(
    volunteersData[0]
  );

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-muted/20">
      <aside className="w-full lg:w-[380px] border-b lg:border-r lg:border-b-0 bg-background flex flex-col">
        <div className="p-6">
          <h1 className="text-3xl font-bold">Gestión de Voluntarios</h1>
          <p className="text-muted-foreground mt-1">
            Vea, gestione y programe a todos los voluntarios de la iglesia.
          </p>
        </div>
        <div className="px-6 pb-4 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Generar Reporte
            </Button>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Voluntario
            </Button>
        </div>
        <div className="px-6 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre de voluntario..." className="pl-9" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Rol: Todos" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todos los Roles</SelectItem>
                    <SelectItem value="leader">Líder de Grupo de Jóvenes</SelectItem>
                    <SelectItem value="tech">Técnico de AV</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Habilidad: Todas" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todas las Habilidades</SelectItem>
                    <SelectItem value="childcare">Cuidado de Niños</SelectItem>
                    <SelectItem value="leadership">Liderazgo</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Disponibilidad: Toda" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Cualquier Disponibilidad</SelectItem>
                    <SelectItem value="sunday-morning">Domingos por la Mañana</SelectItem>
                    <SelectItem value="wed-evening">Miércoles por la Tarde</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-6">
          {volunteersData.map((volunteer) => (
            <div
              key={volunteer.id}
              className={`p-3 rounded-lg cursor-pointer flex items-center gap-4 transition-colors ${
                selectedVolunteer.id === volunteer.id
                  ? 'bg-primary/10 text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedVolunteer(volunteer)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={volunteer.avatarUrl} alt={volunteer.name} />
                <AvatarFallback>
                  {volunteer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{volunteer.name}</p>
                <p className="text-sm text-muted-foreground">{volunteer.role}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={selectedVolunteer.avatarUrl} alt={selectedVolunteer.name} />
                        <AvatarFallback>{selectedVolunteer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{selectedVolunteer.name}</h2>
                        <p className="text-muted-foreground text-sm sm:text-base break-all">{selectedVolunteer.email} | {selectedVolunteer.phone}</p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Horas Servidas</p>
                                <p className="text-lg font-semibold">{selectedVolunteer.hoursServed}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Próximo Servicio</p>
                                <p className="text-lg font-semibold">{selectedVolunteer.nextServing}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Verificación de Antecedentes</p>
                                <Badge variant={selectedVolunteer.backgroundCheck === 'Aprobado' ? 'default' : 'destructive'} className={selectedVolunteer.backgroundCheck === 'Aprobado' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                    {selectedVolunteer.backgroundCheck}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="schedule">Horario</TabsTrigger>
            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="grid grid-cols-1 gap-6 mt-4">
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">Habilidades e Intereses</h3>
                        <Button variant="link" className="p-0 h-auto">Añadir Habilidad</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {selectedVolunteer.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">Disponibilidad General</h3>
                        <Button variant="link" className="p-0 h-auto">Editar Disponibilidad</Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(selectedVolunteer.availability).map(([day, times]) => (
                            <Card key={day} className="p-4 bg-muted/50">
                                <p className="font-semibold">{day}</p>
                                <div className="mt-2 space-y-2">
                                    {times.map(time => (
                                        <div key={time.time} className="flex items-center gap-2">
                                            {time.available ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                            <span className="text-sm">{time.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">Notas Administrativas</h3>
                        <Button variant="link" className="p-0 h-auto">Añadir Nota</Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {selectedVolunteer.adminNotes || 'No hay notas administrativas para este voluntario.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="p-6 text-center text-muted-foreground">
                La gestión de horarios de voluntarios estará disponible próximamente.
            </div>
          </TabsContent>
          <TabsContent value="assignments">
            <div className="p-6 text-center text-muted-foreground">
                El seguimiento de asignaciones de voluntarios estará disponible próximamente.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
