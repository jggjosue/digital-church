'use client';

import * as React from 'react';
import {
  Search,
  Edit,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Calendar as CalendarIcon,
  Trash2,
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
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DayPicker } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Volunteer = (typeof volunteersData)[0];

export default function VolunteersPage() {
  const [selectedVolunteer, setSelectedVolunteer] = React.useState<Volunteer>(
    volunteersData[0]
  );
  const [isAddSkillOpen, setIsAddSkillOpen] = React.useState(false);
  const [isEditAvailabilityOpen, setIsEditAvailabilityOpen] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState<Date[] | undefined>([new Date(2023, 10, 22), new Date(2023, 10, 23), new Date(2023, 10, 24), new Date(2023, 10, 25)]);
  const [noteDate, setNoteDate] = React.useState<Date | undefined>(new Date());

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
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/volunteers/${selectedVolunteer.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
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
                        <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto">Añadir Habilidad</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Añadir Habilidad a {selectedVolunteer.name}</DialogTitle>
                                    <DialogDescription>
                                        Seleccione o ingrese una nueva habilidad y califique la competencia.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="skill-name">Nombre de la Habilidad</Label>
                                        <Select>
                                            <SelectTrigger id="skill-name">
                                                <SelectValue placeholder="Música (Guitarra)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="music-piano">Música (Piano)</SelectItem>
                                                <SelectItem value="music-guitar">Música (Guitarra)</SelectItem>
                                                <SelectItem value="music-vocals">Música (Voz)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nivel de Competencia</Label>
                                        <Slider defaultValue={[2]} max={4} step={1} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Principiante</span>
                                            <span>Intermedio</span>
                                            <span>Avanzado</span>
                                            <span>Experto</span>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>Cancelar</Button>
                                    <Button onClick={() => setIsAddSkillOpen(false)}>Añadir Habilidad</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                        <Dialog open={isEditAvailabilityOpen} onOpenChange={setIsEditAvailabilityOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto">Editar Disponibilidad</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <div className='flex items-center gap-4'>
                                        <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-lg bg-muted">
                                            <CalendarIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <DialogTitle>Editar Disponibilidad de {selectedVolunteer.name}</DialogTitle>
                                            <DialogDescription>
                                                Establezca la disponibilidad recurrente y las fechas específicas de indisponibilidad.
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                    <div className='space-y-4'>
                                        <h4 className="font-semibold">Disponibilidad Recurrente</h4>
                                        <div className="space-y-4">
                                            <Card className="p-4">
                                                <Label className="font-semibold">Dom</Label>
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center gap-2"><Checkbox id="sun-morn" defaultChecked /> <Label htmlFor='sun-morn' className='font-normal'>Mañana (8am - 12pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="sun-aft" /> <Label htmlFor='sun-aft' className='font-normal'>Tarde (12pm - 5pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="sun-eve" /> <Label htmlFor='sun-eve' className='font-normal'>Noche (5pm - 9pm)</Label></div>
                                                </div>
                                            </Card>
                                             <Card className="p-4">
                                                <Label className="font-semibold">Mié</Label>
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center gap-2"><Checkbox id="wed-morn" /> <Label htmlFor='wed-morn' className='font-normal'>Mañana (8am - 12pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="wed-aft" /> <Label htmlFor='wed-aft' className='font-normal'>Tarde (12pm - 5pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="wed-eve" defaultChecked /> <Label htmlFor='wed-eve' className='font-normal'>Noche (5pm - 9pm)</Label></div>
                                                </div>
                                            </Card>
                                             <Card className="p-4">
                                                <Label className="font-semibold">Sáb</Label>
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center gap-2"><Checkbox id="sat-morn" defaultChecked/> <Label htmlFor='sat-morn' className='font-normal'>Mañana (8am - 12pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="sat-aft" defaultChecked/> <Label htmlFor='sat-aft' className='font-normal'>Tarde (12pm - 5pm)</Label></div>
                                                    <div className="flex items-center gap-2"><Checkbox id="sat-eve" defaultChecked/> <Label htmlFor='sat-eve' className='font-normal'>Noche (5pm - 9pm)</Label></div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <h4 className="font-semibold">Indisponibilidad Puntual</h4>
                                        <Card className="p-4">
                                            <DayPicker
                                                mode="multiple"
                                                selected={selectedDates}
                                                onSelect={setSelectedDates}
                                                defaultMonth={new Date(2023, 10)}
                                                modifiers={{ unavailable: new Date(2023, 10, 18) }}
                                                modifiersClassNames={{ unavailable: 'text-red-500' }}
                                                footer={<Button size="sm" variant="link" className='w-full'>Añadir Fecha</Button>}
                                            />
                                        </Card>
                                        <div className='space-y-2'>
                                            <h5 className="font-medium text-sm">Próximas Fechas de Indisponibilidad:</h5>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between bg-red-50 text-red-900 p-2 rounded-md">
                                                    <span className="text-sm">18 de Noviembre, 2023</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                                <div className="flex items-center justify-between bg-red-50 text-red-900 p-2 rounded-md">
                                                    <span className="text-sm">22 - 25 de Nov, 2023 (Vacaciones de Acción de Gracias)</span>
                                                     <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditAvailabilityOpen(false)}>Cancelar</Button>
                                    <Button onClick={() => setIsEditAvailabilityOpen(false)}>Guardar Cambios</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                            <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto">Añadir Nota</Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Añadir Nueva Nota para {selectedVolunteer.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="note-content">Contenido de la Nota</Label>
                                        <Textarea id="note-content" placeholder="Ingrese los detalles de la nota..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="note-date">Fecha</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !noteDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {noteDate ? format(noteDate, "PPP") : <span>Seleccione una fecha</span>}
                                                </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={noteDate}
                                                    onSelect={setNoteDate}
                                                    initialFocus
                                                />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="note-author">Autor</Label>
                                            <Input id="note-author" defaultValue="Admin User" readOnly />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="note-category">Categoría</Label>
                                            <Select defaultValue="general">
                                                <SelectTrigger id="note-category">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="feedback">Comentarios</SelectItem>
                                                    <SelectItem value="follow-up">Seguimiento</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="note-visibility">Visibilidad</Label>
                                            <Select defaultValue="admins">
                                                <SelectTrigger id="note-visibility">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admins">Solo Administradores</SelectItem>
                                                    <SelectItem value="leadership">Liderazgo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancelar</Button>
                                    <Button onClick={() => setIsAddNoteOpen(false)}>Guardar Nota</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
