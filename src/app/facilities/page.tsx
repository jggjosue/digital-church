
'use client';

import * as React from 'react';
import {
  Users,
  Presentation,
  Wind,
  Projector,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const halls = [
    {
      name: 'Salón Santuario',
      capacity: 300,
      feature: 'Escenario',
      icon: <Presentation className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Salón Comunitario',
      capacity: 150,
      feature: 'Sistema AV',
      icon: <Clapperboard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Sala de Oración A',
      capacity: 25,
      feature: 'Aire Acondicionado',
      icon: <Wind className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Centro Juvenil',
      capacity: 50,
      feature: 'Proyector',
      icon: <Projector className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: 'Biblioteca y Sala de Estudio',
      capacity: 20,
      feature: 'Wi-Fi',
      icon: <Wifi className="h-4 w-4 text-muted-foreground" />,
    },
  ];
  
  const events = {
    '2023-11-05': [{ title: 'Servicio Dominical', color: 'bg-red-100 text-red-800', hall: 'Salón Santuario' }],
    '2023-11-09': [{ title: 'Grupo de Jóvenes', color: 'bg-green-100 text-green-800', hall: 'Centro Juvenil' }],
    '2023-11-11': [{ title: 'Ensayo de Boda', color: 'bg-yellow-100 text-yellow-800', hall: 'Salón Santuario' }],
    '2023-11-12': [
      { title: 'Servicio Dominical', color: 'bg-red-100 text-red-800', hall: 'Salón Santuario' },
      { title: 'Ceremonia de Boda', color: 'bg-yellow-100 text-yellow-800', hall: 'Salón Santuario' },
      { title: 'Estudio Bíblico', color: 'bg-blue-100 text-blue-800', hall: 'Biblioteca y Sala de Estudio' },
    ],
    '2023-11-14': [{ title: 'Reunión Comunitaria', color: 'bg-blue-100 text-blue-800', hall: 'Salón Comunitario' }],
    '2023-11-19': [{ title: 'Servicio Dominical', color: 'bg-red-100 text-red-800', hall: 'Salón Santuario' }],
    '2023-11-23': [{ title: 'Servicio de Acción de Gracias', color: 'bg-blue-100 text-blue-800', hall: 'Salón Comunitario' }],
    '2023-11-26': [{ title: 'Servicio Dominical', color: 'bg-red-100 text-red-800', hall: 'Salón Santuario' }],
  };

export default function FacilitiesPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2023, 10, 1)); // November 2023
  const [selectedHallName, setSelectedHallName] = React.useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = Array.from({ length: firstDay }, (_, i) => ({
    day: getDaysInMonth(year, month - 1) - firstDay + i + 1,
    isCurrentMonth: false,
  }));

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isCurrentMonth: true });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  const remainingDays = totalCells - calendarDays.length;

  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Gestión de Salones y Salas"
        description="Programe y gestione los espacios disponibles de su templo."
      >
        <Button asChild>
          <Link href="/facilities/new"><Plus className='h-4 w-4 mr-2' />Registrar Salón</Link>
        </Button>
      </AppHeader>
      <main className="flex-1 flex flex-col md:flex-row min-h-0 bg-muted/20">
        <aside className="w-full md:w-80 border-b md:border-r md:border-b-0 bg-background flex flex-col p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Filtrar por Salón</h3>
            <Select value={selectedHallName} onValueChange={setSelectedHallName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Salones</SelectItem>
                {halls.map(hall => <SelectItem key={hall.name} value={hall.name}>{hall.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className='mt-4 flex-1 overflow-y-auto space-y-2'>
            {halls.map((hall, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 cursor-pointer border rounded-lg',
                  selectedHallName === hall.name ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                )}
                onClick={() => setSelectedHallName(hall.name)}
              >
                <h4 className={cn('font-semibold', selectedHallName === hall.name && 'text-foreground')}>{hall.name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Capacidad: {hall.capacity}</span>
                  <span className="flex items-center gap-1.5">{hall.icon} {hall.feature}</span>
                </div>
              </div>
            ))}
            </div>
        </aside>
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5" /></Button>
                  <h2 className="text-lg font-semibold">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></Button>
                  <Button variant="outline" onClick={goToToday}>Hoy</Button>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                    <Button variant="secondary" size="sm">Mes</Button>
                    <Button variant="ghost" size="sm">Semana</Button>
                    <Button variant="ghost" size="sm">Día</Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-px border-t border-l bg-border">
                {dayNames.map(day => (
                  <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card">{day}</div>
                ))}
                {calendarDays.map((date, index) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                    const dayEvents = (date.isCurrentMonth ? events[dateStr as keyof typeof events] : []) || [];
                    const filteredEvents = selectedHallName === 'all'
                        ? dayEvents
                        : dayEvents.filter(event => event.hall === selectedHallName);
                    return(
                  <div key={index} className={cn("relative h-20 sm:h-28 p-1 sm:p-2 bg-card border-r border-b", date.isCurrentMonth ? '' : 'bg-muted/50 text-muted-foreground/50')}>
                    <div className="text-xs sm:text-sm text-right">{date.day}</div>
                    <div className="mt-1 space-y-1">
                      {filteredEvents.map((event, eventIndex) => (
                        <div key={eventIndex} className={cn("p-1 rounded-md text-[10px] sm:text-xs truncate", event.color)}>
                            {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
