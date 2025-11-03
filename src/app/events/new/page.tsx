'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function NewEventPage() {
    const [date, setDate] = React.useState<Date | undefined>();

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Evento</h1>
          <p className="text-muted-foreground">
            Complete los detalles a continuación para programar un nuevo evento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="event-title">Título del Evento</Label>
                        <Input id="event-title" placeholder="Ej., Servicio Dominical, Estudio Bíblico..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción del Evento</Label>
                        <Textarea id="description" placeholder="Proporcione una breve descripción del evento." rows={5} />
                    </div>
                    <div className="space-y-2">
                        <Label>Imagen del Evento</Label>
                        <div className="flex items-center justify-center w-full">
                            <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG o GIF (MÁX. 800x400px)</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" />
                            </Label>
                        </div> 
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Programación</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="event-date">Fecha del Evento</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Seleccione una fecha</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Hora de Inicio</Label>
                            <Input id="start-time" type="time" defaultValue="10:00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">Hora de Finalización</Label>
                            <Input id="end-time" type="time" defaultValue="11:30" />
                        </div>
                    </div>
                 </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Detalles Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="servicio-dominical">Servicio Dominical</SelectItem>
                                <SelectItem value="estudio-biblico">Estudio Bíblico</SelectItem>
                                <SelectItem value="grupo-jovenes">Grupo de Jóvenes</SelectItem>
                                <SelectItem value="alcance-comunitario">Alcance Comunitario</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input id="location" placeholder="Ej., Santuario Principal" />
                    </div>
                </CardContent>
             </Card>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Crear Evento</Button>
            </div>
        </div>
      </div>
    </main>
  );
}
