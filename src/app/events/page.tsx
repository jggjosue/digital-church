'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  ListFilter,
  Calendar as CalendarIcon,
  MapPin,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';

type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  startAt: string;
  endAt?: string;
};

const eventCategoryColors: { [key: string]: string } = {
  'Estudio Bíblico': 'bg-purple-100 text-purple-800 border-purple-200',
  'Servicio Dominical': 'bg-blue-100 text-blue-800 border-blue-200',
  'Grupo de Jóvenes': 'bg-green-100 text-green-800 border-green-200',
  'Alcance Comunitario': 'bg-orange-100 text-orange-800 border-orange-200',
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

function EventDetails({ event, date, onEventDelete }: { event: Event | null, date: Date | null, onEventDelete: (event: Event) => void }) {
    if (!event || !date) return null;
    
    const startAt = new Date(event.startAt);

    return (
        <div className="mt-6">
            <Image
                src={PlaceHolderImages.find(p => p.id === 'event-bible-study')?.imageUrl || ''}
                alt={event.title}
                width={400}
                height={200}
                className="rounded-lg object-cover w-full"
                data-ai-hint="people studying"
            />
            <Badge variant="outline" className={`mt-4 ${eventCategoryColors[event.category] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {event.category || 'General'}
            </Badge>
            <h3 className="mt-2 text-2xl font-bold">{event.title}</h3>
            <p className="mt-2 text-muted-foreground">
                {event.description}
            </p>
            <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Fecha y Hora</p>
                        <p className="text-muted-foreground">{startAt.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-muted-foreground">{startAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Ubicación</p>
                        <p className="text-muted-foreground">{event.location || 'Sin ubicación específica'}</p>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex gap-2">
                <Button variant="outline" className="w-full" asChild><Link href={`/events/${event.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Editar</Link></Button>
                 <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" onClick={() => onEventDelete(event)}><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
                </AlertDialogTrigger>
            </div>
        </div>
    )
}

export default function EventsPage() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedDay, setSelectedDay] = React.useState<number>(new Date().getDate());
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    fetch('/api/data/events')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setEvents(data.items);
          if (data.items.length > 0) {
              const now = new Date();
              const currentMonthEvents = data.items.filter((e: Event) => {
                const d = new Date(e.startAt);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              });
              if (currentMonthEvents.length > 0) {
                  setSelectedEvent(currentMonthEvents[0]);
                  setSelectedDay(new Date(currentMonthEvents[0].startAt).getDate());
              }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = Array.from({ length: firstDay }, (_, i) => ({
    day: new Date(year, month, i - firstDay + 1).getDate(),
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

  const handleSelectEvent = (event: Event | null, day: number) => {
    if (event) {
        setSelectedEvent(event);
        setSelectedDay(day);
    }
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  const selectedDate = new Date(year, month, selectedDay);

  const handleDelete = async () => {
    if (eventToDelete) {
      setDeleting(true);
      try {
        const res = await fetch(`/api/data/events/${eventToDelete.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('No se pudo eliminar el evento.');
        setEvents(events.filter(e => e.id !== eventToDelete.id));
        if (selectedEvent?.id === eventToDelete.id) {
          setSelectedEvent(null);
        }
        toast({ title: 'Evento eliminado' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido' });
      } finally {
        setDeleting(false);
        setEventToDelete(null);
      }
    }
  };

  return (
    <AlertDialog>
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Eventos de la Iglesia"
        description="Vea, cree y gestione todos los eventos y actividades de la iglesia."
      >
        <Button asChild>
          <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Evento
          </Link>
        </Button>
      </AppHeader>
    <main className="flex flex-col lg:flex-row flex-1 w-full bg-muted/20">
      <div className="flex-1 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar un evento por nombre..." className="pl-9" />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <ListFilter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold capitalize">
                  {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <Button variant="ghost" size="sm" className="bg-background shadow-sm">Mes</Button>
                <Button variant="ghost" size="sm" asChild><Link href="/events/activities">Día</Link></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
            <div className="grid grid-cols-7 gap-px border-t border-l bg-border">
              {dayNames.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, index) => {
                 const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.startAt);
                    return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === date.day && date.isCurrentMonth;
                });

                const eventToDisplay = dayEvents[0];

                return (
                  <Sheet key={index}>
                    <div className={`relative h-20 sm:h-24 p-1 sm:p-2 bg-card border-r border-b ${date.isCurrentMonth ? '' : 'bg-muted/50 text-muted-foreground'}`}>
                        <div className={`text-sm text-right sm:text-left ${selectedDay === date.day && date.isCurrentMonth ? 'font-bold text-primary' : ''}`}>
                          {date.day}
                        </div>
                        <div className="mt-1 space-y-1">
                            {eventToDisplay && (
                              <SheetTrigger asChild>
                                <div 
                                  className={`p-1 rounded-md text-xs truncate cursor-pointer ${eventCategoryColors[eventToDisplay.category] || 'bg-gray-100 text-gray-800'} ${selectedEvent?.id === eventToDisplay.id ? 'ring-2 ring-primary' : ''}`}
                                  onClick={() => handleSelectEvent(eventToDisplay, date.day)}
                                >
                                    <span className='hidden sm:inline'>{eventToDisplay.title.split(' ').slice(0,2).join(' ')}</span>
                                    <span className='sm:hidden'>●</span>
                                </div>
                              </SheetTrigger>
                            )}
                        </div>
                      </div>
                      {!isDesktop && eventToDisplay && (
                        <SheetContent side="bottom" className="h-[80%] overflow-y-auto">
                            <EventDetails event={selectedEvent} date={selectedDate} onEventDelete={setEventToDelete} />
                        </SheetContent>
                      )}
                  </Sheet>
                );
              })}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="w-full lg:w-96 border-l p-8 bg-background hidden lg:block overflow-y-auto">
        <h2 className="text-xl font-bold">Detalles del Evento</h2>
        <p className="text-muted-foreground text-sm">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <EventDetails event={selectedEvent} date={selectedDate} onEventDelete={setEventToDelete} />
      </aside>

        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className='text-center'>Eliminar Evento</AlertDialogTitle>
                <AlertDialogDescription className='text-center'>
                    ¿Estás seguro de que quieres eliminar el evento "{eventToDelete?.title}"? Esta acción no se puede deshacer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
                <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Eliminación'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>

    </main>
    </div>
    </AlertDialog>
  );
}
