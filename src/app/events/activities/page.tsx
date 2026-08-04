'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

const eventCategoryColors: { [key: string]: string } = {
  'Estudio Bíblico': 'bg-purple-100 text-purple-800 border-purple-200',
  'Servicio Dominical': 'bg-blue-100 text-blue-800 border-blue-200',
  'Grupo de Jóvenes': 'bg-green-100 text-green-800 border-green-200',
  'Alcance Comunitario': 'bg-orange-100 text-orange-800 border-orange-200',
};

type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  startAt: string;
  endAt?: string;
};

export default function ActivitiesPage() {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [events, setEvents] = React.useState<Event[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        fetch('/api/data/events')
          .then(res => res.json())
          .then(data => {
              if (data.items) {
                  setEvents(data.items);
              }
          })
          .catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    const handleDateChange = (days: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const eventsForDay = events.filter(e => {
        const d = new Date(e.startAt);
        return d.getFullYear() === currentDate.getFullYear() && 
               d.getMonth() === currentDate.getMonth() && 
               d.getDate() === currentDate.getDate();
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title={`Eventos del ${formattedDate}`}
        description={`Hay un total de ${eventsForDay.length} eventos programados para este día.`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="w-full sm:w-auto mr-auto hidden sm:flex">
                <Link href="/events">
                    Volver al Calendario
                </Link>
            </Button>
            <Button variant="ghost" onClick={() => handleDateChange(-1)} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Día Anterior
            </Button>
            <Button variant="ghost" onClick={() => handleDateChange(1)} className="w-full sm:w-auto">
                Siguiente Día
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button asChild className="w-full sm:w-auto">
                <Link href="/events/new">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Evento
                </Link>
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      {loading ? (
          <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      ) : (
      <div className="space-y-6">
        {eventsForDay.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No hay eventos programados para este día.</p>
        )}
        {eventsForDay.map((event, index) => {
            const startDate = new Date(event.startAt);
            const endDate = event.endAt ? new Date(event.endAt) : null;
            
            const startTime = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const endTime = endDate ? endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-4 bg-muted/50 border-b sm:border-b-0 sm:border-r border-border">
                      <p className="text-lg font-bold text-primary">{startTime}</p>
                      {endTime && (
                          <>
                            <div className="h-px w-4 sm:h-full sm:w-px bg-border my-2 mx-2 sm:mx-0"></div>
                            <p className="text-sm text-muted-foreground">{endTime}</p>
                          </>
                      )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <Badge variant="outline" className={eventCategoryColors[event.category] || 'bg-gray-100 text-gray-800'}>{event.category || 'General'}</Badge>
                      <h3 className="text-xl font-semibold mt-2">{event.title}</h3>
                      <p className="text-muted-foreground mt-1 max-w-xl">{event.description}</p>
                      {event.location && (
                          <p className="text-sm font-medium mt-2 text-primary">{event.location}</p>
                      )}
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto mt-4 sm:mt-0" asChild>
                        <Link href={`/events/${event.id}`}>Ver Detalles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
        })}
      </div>
      )}
    </main>
    </div>
  );
}
