'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { events as allEvents } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';

const eventCategoryColors: { [key: string]: string } = {
  'Estudio Bíblico': 'bg-purple-100 text-purple-800 border-purple-200',
  'Servicio Dominical': 'bg-blue-100 text-blue-800 border-blue-200',
  'Grupo de Jóvenes': 'bg-green-100 text-green-800 border-green-200',
  'Alcance Comunitario': 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function EventDetailsPage({ params }: { params: { id: string } }) {
    const event = allEvents.find(e => e.id.toString() === params.id);

    if (!event) {
        notFound();
    }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/events/activities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Evento</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
            <CardContent className="p-6">
                 <Image
                    src={PlaceHolderImages.find(p => p.id === 'event-bible-study')?.imageUrl || ''}
                    alt={event.title}
                    width={800}
                    height={400}
                    className="rounded-lg object-cover w-full mb-6"
                    data-ai-hint="people studying"
                />
                <Badge variant="outline" className={`mt-4 ${eventCategoryColors[event.category]}`}>
                    {event.category}
                </Badge>
                <h2 className="mt-2 text-3xl font-bold">{event.title}</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    {event.description}
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <CalendarIcon className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-lg">Fecha y Hora</p>
                            <p className="text-muted-foreground">{new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-muted-foreground">{event.time}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-lg">Ubicación</p>
                            <p className="text-muted-foreground">{event.location}</p>
                            <p className="text-muted-foreground">{event.address}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Button className="w-full" asChild><Link href={`/events/${event.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Editar</Link></Button>
                    <Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
                </div>
            </CardContent>
        </Card>
      </div>

    </main>
  );
}
