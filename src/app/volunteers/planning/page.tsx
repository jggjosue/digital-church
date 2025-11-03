'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  List,
  LayoutGrid,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { volunteersData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const availableVolunteers = volunteersData.slice(0, 3);

const scheduleData = {
  '2023-10-22': [
    {
      service: 'Sunday Morning Service',
      time: '9:00 AM - 10:30 AM',
      totalVolunteers: 6,
      neededVolunteers: 10,
      roles: [
        {
          name: 'Worship Leader',
          assigned: 1,
          needed: 1,
          volunteers: [{ name: 'Ava Nguyen', avatarUrl: 'https://picsum.photos/seed/103/40/40' }],
        },
        {
          name: 'AV Tech',
          assigned: 1,
          needed: 2,
          volunteers: [{ name: 'Liam Rodriguez', avatarUrl: 'https://picsum.photos/seed/102/40/40' }],
        },
        {
          name: 'Greeters',
          assigned: 2,
          needed: 4,
          volunteers: [
            { name: 'Noah Patel', avatarUrl: 'https://picsum.photos/seed/104/40/40' },
            { name: 'Emma Garcia', avatarUrl: 'https://picsum.photos/seed/105/40/40', conflict: true },
          ],
        },
        {
          name: "Children's Ministry",
          assigned: 2,
          needed: 3,
          volunteers: [
            { name: 'Emma Garcia', avatarUrl: 'https://picsum.photos/seed/105/40/40' },
            { name: 'Olivia Chen', avatarUrl: 'https://picsum.photos/seed/101/40/40' },
          ],
        },
      ],
    },
    {
      service: 'Youth Group Hangout',
      time: '6:00 PM - 8:00 PM',
      totalVolunteers: 2,
      neededVolunteers: 4,
      roles: [],
    },
  ],
};


export default function VolunteerSchedulingPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date('2023-10-22T00:00:00'));
  const [view, setView] = React.useState('list');

  const selectedDateString = date ? date.toISOString().split('T')[0] : '';
  const todaysSchedule = scheduleData[selectedDateString as keyof typeof scheduleData] || [];

  return (
    <main className="flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.16))] bg-muted/20">
      <aside className="w-full lg:w-[320px] border-b lg:border-r lg:border-b-0 bg-background flex flex-col p-6">
        <h2 className="text-xl font-bold">Planificación de Voluntarios</h2>
        <p className="text-sm text-muted-foreground">Asigne voluntarios a eventos y gestione los horarios.</p>
        
        <div className="mt-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-0"
            classNames={{
                caption: "flex justify-between items-center px-4 pt-2",
                nav_button_previous: 'relative',
                nav_button_next: 'relative',
            }}
            components={{
              IconLeft: () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
          />
        </div>
        
        <div className="mt-6 space-y-4">
            <h3 className="text-base font-semibold">Filtros</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium">Ministerio</label>
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los Ministerios" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Ministerios</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Voluntario</label>
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los Voluntarios" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Voluntarios</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
            <h3 className="text-base font-semibold">Voluntarios Disponibles</h3>
            <div className="mt-2 space-y-2">
                {availableVolunteers.map(v => (
                    <Card key={v.id} className="p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={v.avatarUrl} alt={v.name} />
                                <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{v.name}</p>
                                <p className="text-xs text-muted-foreground">{v.role}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
                Horario para {date ? date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}) : 'Ninguna fecha seleccionada'}
            </h2>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Send className="mr-2 h-4 w-4" />Comunicar</Button>
                <Button><Save className="mr-2 h-4 w-4" />Guardar Horario</Button>
            </div>
        </div>

         <div className="flex items-center justify-end gap-1 rounded-lg bg-muted p-1 mt-4">
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}><List className="mr-2 h-4 w-4"/>Vista de Lista</Button>
            <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('calendar')}><LayoutGrid className="mr-2 h-4 w-4"/>Vista de Calendario</Button>
         </div>

         <div className="mt-6 space-y-6">
            {todaysSchedule.map((event, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <CardTitle className="text-lg">{event.service}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1 sm:mt-0">{event.time}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{event.totalVolunteers} / {event.neededVolunteers} voluntarios</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                      {view === 'calendar' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {event.roles.map(role => (
                                  <Card key={role.name} className="p-4 bg-muted/50">
                                      <h4 className="font-semibold text-sm">{role.name} ({role.assigned}/{role.needed})</h4>
                                      <div className="mt-3 space-y-2">
                                          {role.volunteers.map(v => (
                                              <Card key={v.name} className="p-2 bg-card">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                          <Avatar className="h-7 w-7">
                                                              <AvatarImage src={v.avatarUrl} alt={v.name} />
                                                              <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                                                          </Avatar>
                                                          <span className="text-sm font-medium">{v.name}</span>
                                                      </div>
                                                      {v.conflict && <Badge variant="destructive" className="h-5"><AlertTriangle className="h-3 w-3 mr-1"/>Conflicto</Badge>}
                                                  </div>
                                              </Card>
                                          ))}
                                          {Array.from({ length: role.needed - role.assigned }).map((_, i) => (
                                               <div key={i} className="h-10 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground text-sm">
                                                  Arrastre voluntario aquí
                                               </div>
                                          ))}
                                      </div>
                                  </Card>
                              ))}
                          </div>
                      ) : (
                        <div className='overflow-x-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Rol</TableHead>
                                <TableHead>Necesarios</TableHead>
                                <TableHead>Asignados</TableHead>
                                <TableHead>Voluntarios</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {event.roles.map(role => (
                                <TableRow key={role.name}>
                                  <TableCell className='font-semibold'>{role.name}</TableCell>
                                  <TableCell>{role.needed}</TableCell>
                                  <TableCell>{role.assigned}</TableCell>
                                  <TableCell>
                                    <div className='flex flex-wrap gap-2'>
                                      {role.volunteers.map(v => (
                                        <div key={v.name} className='flex items-center gap-2'>
                                          <Avatar className="h-7 w-7">
                                              <AvatarImage src={v.avatarUrl} alt={v.name} />
                                              <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm font-medium">{v.name}</span>
                                          {v.conflict && <Badge variant="destructive" className="h-5"><AlertTriangle className="h-3 w-3 mr-1"/>Conflicto</Badge>}
                                        </div>
                                      ))}
                                      {Array.from({ length: role.needed - role.assigned }).map((_, i) => (
                                           <div key={i} className="h-10 w-40 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground text-sm">
                                              Puesto Vacante
                                           </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                </Card>
            ))}
         </div>
      </div>
    </main>
  );
}
