'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Loader2
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
import { useRouter } from 'next/navigation';
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
import { MemberSelector } from '@/components/member-selector';

const formSchema = z.object({
  type: z.string().min(1, 'El tipo de ceremonia es requerido'),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  participants: z.string().optional(),
  memberIds: z.array(z.string()).default([]),
  officiant: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCeremonyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: '',
            participants: '',
            memberIds: [],
            officiant: '',
            notes: '',
        }
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                type: values.type,
                date: values.date.toISOString(),
                participants: values.participants ? values.participants.split(',').map(s => s.trim()).filter(Boolean) : [],
                memberIds: values.memberIds,
                officiant: values.officiant,
                notes: values.notes,
                status: 'completed'
            };

            const res = await fetch('/api/data/ceremonies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Error al guardar el registro');

            toast({ title: 'Ceremonia registrada', description: 'El evento ha sido registrado exitosamente.' });
            router.push('/ceremonies');
            router.refresh();
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo registrar el evento', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <AppHeader
                title="Añadir Nuevo Registro de Ceremonia"
                description="Complete el formulario para registrar una nueva ceremonia."
            >
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/ceremonies">Cancelar</Link>
                    </Button>
                    <Button disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Registro
                    </Button>
                </div>
            </AppHeader>
            <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Detalles de la Ceremonia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Ceremonia</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Bautismo">Bautismo</SelectItem>
                                                    <SelectItem value="Matrimonio">Matrimonio</SelectItem>
                                                    <SelectItem value="Dedicación de Niño">Dedicación de Niño</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    
                                    <FormField control={form.control} name="date" render={({ field }) => (
                                        <FormItem className="flex flex-col justify-end">
                                            <FormLabel>Fecha</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "MM/dd/yyyy") : <span>Seleccione fecha</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="space-y-6 border rounded-md p-4">
                                    <h3 className="font-medium text-sm">Participantes de la Ceremonia</h3>
                                    <FormField control={form.control} name="memberIds" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Buscar Miembros (Directorio)</FormLabel>
                                            <FormControl>
                                                <MemberSelector 
                                                  multiple
                                                  selectedIds={field.value}
                                                  onSelectedIdsChange={field.onChange}
                                                  placeholder="Buscar miembros registrados..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="participants" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Otros Participantes (Nombres separados por coma)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej., Juan Pérez, María y José García (visitantes)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="officiant" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Oficiante</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej., Pastor David Chen" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="notes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Añada detalles adicionales, como nombres de testigos, padres, etc." rows={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <button type="submit" className="hidden" />
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
