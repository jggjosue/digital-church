
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

type CalendarEvent = {
    title: string;
    color: string;
    hall: string;
    date: Date;
};

export default function FacilitiesPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2023, 10, 1)); // November 2023
  const [selectedHallName, setSelectedHallName] = React.useState('all');
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [view, setView] = React.useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (view === 'month') {
        setCurrentDate(new Date(year, month - 1, 1));
    } else {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - (view === 'week' ? 7 : 1));
        setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
        setCurrentDate(new Date(year, month + 1, 1));
    } else {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (view === 'week' ? 7 : 1));
        setCurrentDate(newDate);
    }
  };
  const goToToday = () => setCurrentDate(new Date());
  
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getMonthViewDays = () => {
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
    return calendarDays;
  }
  
    const getWeekViewDays = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekDays = [];
        for (let i=0; i<7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            weekDays.push({date: day, day: day.getDate()});
        }
        return weekDays;
    }

  const renderMonthView = () => {
    const calendarDays = getMonthViewDays();
    return (
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
                 <AlertDialogTrigger asChild key={eventIndex}>
                    <div
                        onClick={() => setSelectedEvent({ ...event, date: new Date(dateStr) })}
                        className={cn("p-1 rounded-md text-[10px] sm:text-xs truncate cursor-pointer", event.color)}
                    >
                        {event.title}
                    </div>
                </AlertDialogTrigger>
              ))}
            </div>
          </div>
        )})}
      </div>
    );
  }
  
    const renderWeekView = () => {
        const weekDays = getWeekViewDays();
        return (
          <div className="mt-4 grid grid-cols-7 gap-px border-t border-l bg-border">
            {weekDays.map(({ date, day }) => (
              <div key={day} className="bg-card border-r">
                <div className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {dayNames[date.getDay()]} {day}
                </div>
                <div className="h-full min-h-48 p-1 space-y-1">
                  {(() => {
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events[dateStr as keyof typeof events] || [];
                    const filteredEvents = selectedHallName === 'all' ? dayEvents : dayEvents.filter(event => event.hall === selectedHallName);
                    
                    return filteredEvents.map((event, eventIndex) => (
                      <AlertDialogTrigger asChild key={eventIndex}>
                        <div
                            onClick={() => setSelectedEvent({ ...event, date: new Date(dateStr) })}
                            className={cn("p-2 rounded-md text-[10px] sm:text-xs cursor-pointer", event.color)}
                        >
                            <p className="font-semibold truncate">{event.title}</p>
                            <p className="text-xs truncate">{event.hall}</p>
                        </div>
                      </AlertDialogTrigger>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        );
      };
  
  const renderDayView = () => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dayEvents = events[dateStr as keyof typeof events] || [];
    const filteredEvents = selectedHallName === 'all' ? dayEvents : dayEvents.filter(event => event.hall === selectedHallName);

    return (
        <div className="mt-4 border-t border-l border-r bg-border">
            <div className="py-2 text-center text-xs font-medium text-muted-foreground bg-card">
                Eventos
            </div>
            <div className="bg-card p-4 space-y-4">
                {filteredEvents.length > 0 ? filteredEvents.map((event, eventIndex) => (
                    <AlertDialogTrigger asChild key={eventIndex}>
                        <div
                            onClick={() => setSelectedEvent({ ...event, date: new Date(dateStr) })}
                            className={cn("p-4 rounded-md cursor-pointer flex justify-between items-center", event.color)}
                        >
                            <span className="font-semibold">{event.title}</span>
                            <span className="text-sm">{event.hall}</span>
                        </div>
                    </AlertDialogTrigger>
                )) : <p className="text-muted-foreground text-center py-8">No hay eventos programados para este día.</p>}
            </div>
        </div>
    );
  };

  const getHeaderDateString = () => {
    if (view === 'month') {
        return currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
            return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${startOfWeek.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;
        }
        return `${startOfWeek.getDate()} de ${startOfWeek.toLocaleString('es-ES', {month: 'short'})} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleString('es-ES', {month: 'short'})}, ${currentDate.getFullYear()}`;
    }
    if (view === 'day') {
        return currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return '';
  }


  return (
    <AlertDialog>
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Gestión de Salones y Salas"
        description="Programe y gestione los espacios disponibles de su templo."
      >
        <Button asChild>
          <Link href="/facilities/new"><Plus className='h-4 w-4 mr-2' />Registrar Salón</Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 sm:p-6 overflow-auto bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-64">
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
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-5 w-5" /></Button>
              <h2 className="text-lg font-semibold text-center w-64">{getHeaderDateString()}</h2>
              <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-5 w-5" /></Button>
              <Button variant="outline" onClick={goToToday}>Hoy</Button>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <Button variant={view === 'month' ? "secondary" : "ghost"} size="sm" onClick={() => setView('month')}>Mes</Button>
                <Button variant={view === 'week' ? "secondary" : "ghost"} size="sm" onClick={() => setView('week')}>Semana</Button>
                <Button variant={view === 'day' ? "secondary" : "ghost"} size="sm" onClick={() => setView('day')}>Día</Button>
            </div>
        </div>
        <Card className='mt-4'>
            <CardContent className="p-4">
              {view === 'month' ? renderMonthView() : view === 'week' ? renderWeekView() : renderDayView()}
            </CardContent>
        </Card>
      </main>
      {selectedEvent && (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{selectedEvent.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    <strong>Salón:</strong> {selectedEvent.hall}<br/>
                    <strong>Fecha:</strong> {selectedEvent.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cerrar</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </div>
    </AlertDialog>
  );
}
