'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { AppHeader } from '@/components/app-header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, { message: 'El título del evento es requerido.' }),
  startDate: z.date({ required_error: 'La fecha de inicio es requerida.' }),
  startTime: z.string().min(1, { message: 'La hora de inicio es requerida.' }),
  endDate: z.date().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NEW_EVENT_FORM_ID = 'new-event-form';

export default function NewEventPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      category: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const startAt = new Date(values.startDate);
      if (values.startTime) {
        const [hours, minutes] = values.startTime.split(':');
        startAt.setHours(Number(hours), Number(minutes));
      }

      let endAt: Date | undefined = undefined;
      if (values.endDate) {
        endAt = new Date(values.endDate);
        if (values.endTime) {
          const [hours, minutes] = values.endTime.split(':');
          endAt.setHours(Number(hours), Number(minutes));
        } else {
            endAt.setHours(23, 59);
        }
      }

      const res = await fetch('/api/data/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title.trim(),
          startAt: startAt.toISOString(),
          endAt: endAt ? endAt.toISOString() : undefined,
          location: values.location?.trim() || undefined,
          description: values.description?.trim() || undefined,
          category: values.category || undefined,
          status: 'scheduled',
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear el evento.');
      }
      
      toast({
        title: 'Evento creado',
        description: 'El evento se ha registrado correctamente.',
      });
      router.push('/events');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Error al guardar el evento.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Crear Nuevo Evento"
        description="Complete el siguiente formulario para agregar un nuevo evento al calendario de la iglesia."
      >
        <div className="flex flex-col sm:flex-row justify-end gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild>
            <Link href="/events">Cancelar</Link>
          </Button>
          <Button type="submit" form={NEW_EVENT_FORM_ID} disabled={saving}>
            {saving ? 'Guardando...' : 'Crear Evento'}
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form id={NEW_EVENT_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej., Picnic Anual de la Iglesia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FormLabel>Fecha y Hora de Inicio</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? format(field.value, "PPP") : <span>Fecha</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" className="w-full sm:w-[140px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Fecha y Hora de Finalización</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? format(field.value, "PPP") : <span>Fecha</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" className="w-full sm:w-[140px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej., Salón de Confraternidad o 123 Church St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Evento</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Proporcione una descripción detallada del evento..." rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría del Evento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Servicio Dominical">Servicio Dominical</SelectItem>
                              <SelectItem value="Estudio Bíblico">Estudio Bíblico</SelectItem>
                              <SelectItem value="Grupo de Jóvenes">Grupo de Jóvenes</SelectItem>
                              <SelectItem value="Alcance Comunitario">Alcance Comunitario</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
