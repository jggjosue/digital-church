
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

export default function NewEventPage() {
    const [startDate, setStartDate] = React.useState<Date | undefined>();
    const [endDate, setEndDate] = React.useState<Date | undefined>();

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Crear Nuevo Evento"
        description="Complete el siguiente formulario para agregar un nuevo evento al calendario de la iglesia."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild><Link href="/events">Cancelar</Link></Button>
            <Button>Crear Evento</Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-3">
              <Card>
                  <CardHeader>
                      <CardTitle>Detalles del Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <Label htmlFor="event-title">Título del Evento</Label>
                          <Input id="event-title" placeholder="Ej., Picnic Anual de la Iglesia" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <Label>Fecha y Hora de Inicio</Label>
                              <div className="flex gap-2">
                                  <Popover>
                                      <PopoverTrigger asChild>
                                      <Button
                                          variant={"outline"}
                                          className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !startDate && "text-muted-foreground"
                                          )}
                                      >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {startDate ? format(startDate, "PPP") : <span>mm/dd/yyyy</span>}
                                      </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                      <Calendar
                                          mode="single"
                                          selected={startDate}
                                          onSelect={setStartDate}
                                          initialFocus
                                      />
                                      </PopoverContent>
                                  </Popover>
                                  <Input type="time" className="w-[140px]" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label>Fecha y Hora de Finalización</Label>
                              <div className="flex gap-2">
                                  <Popover>
                                      <PopoverTrigger asChild>
                                      <Button
                                          variant={"outline"}
                                          className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !endDate && "text-muted-foreground"
                                          )}
                                      >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {endDate ? format(endDate, "PPP") : <span>mm/dd/yyyy</span>}
                                      </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                      <Calendar
                                          mode="single"
                                          selected={endDate}
                                          onSelect={setEndDate}
                                          initialFocus
                                      />
                                      </PopoverContent>
                                  </Popover>
                                  <Input type="time" className="w-[140px]" />
                              </div>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="location">Ubicación</Label>
                          <Input id="location" placeholder="Ej., Salón de Confraternidad o 123 Church St" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="description">Descripción del Evento</Label>
                          <Textarea id="description" placeholder="Proporcione una descripción detallada del evento..." rows={5} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                              <Label htmlFor="category">Categoría del Evento</Label>
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
                              <Label htmlFor="recurrence">Recurrencia</Label>
                              <Select>
                                  <SelectTrigger id="recurrence">
                                      <SelectValue placeholder="No se repite" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">No se repite</SelectItem>
                                      <SelectItem value="daily">Diariamente</SelectItem>
                                      <SelectItem value="weekly">Semanalmente</SelectItem>
                                      <SelectItem value="monthly">Mensualmente</SelectItem>
                                      <SelectItem value="yearly">Anualmente</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="associate">Asociar con Ministerio/Grupo</Label>
                              <Select>
                                  <SelectTrigger id="associate">
                                      <SelectValue placeholder="Ninguno" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">Ninguno</SelectItem>
                                      <SelectItem value="youth-group">Grupo de Jóvenes</SelectItem>
                                      <SelectItem value="choir">Coro</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="all-day" />
                          <Label htmlFor="all-day">Evento de todo el día</Label>
                      </div>

                      <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Por favor corrija los errores</AlertTitle>
                          <AlertDescription>
                            El título del evento no puede estar vacío.
                          </AlertDescription>
                      </Alert>
                  </CardContent>
              </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
