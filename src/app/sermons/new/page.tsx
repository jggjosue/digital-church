'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Upload,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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

// Simplified schema matching the backend
const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  speaker: z.string().min(1, 'El predicador es requerido'),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  series: z.string().optional(),
  scripture: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewSermonPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            speaker: '',
            series: '',
            scripture: '',
            description: '',
        }
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // Simulated upload process can happen here in the future
            
            const payload = {
                title: values.title,
                speaker: values.speaker,
                date: values.date.toISOString(),
                series: values.series,
                scripture: values.scripture,
                description: values.description,
                status: 'published'
            };

            const res = await fetch('/api/data/sermons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Error al guardar el sermón');

            toast({ title: 'Sermón guardado', description: 'El sermón ha sido registrado exitosamente.' });
            router.push('/sermons');
            router.refresh();
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo guardar el sermón', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Añadir Nuevo Sermón"
        description="Rellene los detalles a continuación para añadir un nuevo sermón a la biblioteca."
      >
        <div className="hidden sm:flex gap-2">
            <Button variant="outline" asChild><Link href="/sermons">Cancelar</Link></Button>
            <Button disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Sermón
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título del Sermón</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej., El Poder del Perdón" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="speaker" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Predicador</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un predicador" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Pastor John Doe">Pastor John Doe</SelectItem>
                                        <SelectItem value="Pastora Jane Smith">Pastora Jane Smith</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="series" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Serie (opcional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una serie" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Evangelio de Juan">Evangelio de Juan</SelectItem>
                                        <SelectItem value="Libro de Santiago">Libro de Santiago</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="scripture" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Temas / Etiquetas</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej., Fe, Gracia, Perdón" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas del Sermón / Transcripción</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ingrese notas del sermón, puntos clave o una transcripción completa..." rows={6} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="space-y-2">
                        <FormLabel>Subida de Medios (Simulado por ahora)</FormLabel>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-primary">Subir un archivo o arrastrar y soltar</p>
                                    <p className="text-xs text-muted-foreground">Audio (MP3) o Video (MP4) hasta 500MB</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" />
                            </label>
                        </div> 
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" type="button" asChild className="w-full sm:w-auto"><Link href="/sermons">Cancelar</Link></Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Sermón
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
