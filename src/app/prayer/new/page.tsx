
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppHeader } from '@/components/app-header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createPrayerSchema, type CreatePrayerInput } from '@/lib/prayers';
import { Loader2 } from 'lucide-react';

export default function NewPrayerRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreatePrayerInput>({
    resolver: zodResolver(createPrayerSchema),
    defaultValues: {
      title: '',
      description: '',
      privacy: 'Público',
      isAnonymous: false,
    },
  });

  const onSubmit = async (values: CreatePrayerInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error('No se pudo guardar la petición de oración.');
      }

      toast({
        title: '¡Petición enviada!',
        description: 'La petición de oración ha sido guardada exitosamente.',
      });

      router.push('/prayer');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Hubo un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Nueva Petición de Oración"
        description="Comparta sus necesidades de oración con la comunidad."
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" asChild>
            <Link href="/prayer">Cancelar</Link>
          </Button>
          <Button disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Petición
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles de la Petición de Oración</CardTitle>
            <CardDescription>
              Por favor, proporcione tantos detalles como se sienta cómodo compartiendo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej., Sanidad para un ser querido" {...field} />
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
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Comparta más detalles sobre su petición de oración..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div>
                        <FormLabel>Configuración de Privacidad</FormLabel>
                        <FormDescription>
                          Elija quién puede ver su petición de oración.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <RadioGroupItem value="Público" id="public" />
                            <div className="flex-1">
                              <Label htmlFor="public" className="font-semibold">Público</Label>
                              <p className="text-sm text-muted-foreground">Visible para todos los miembros de la iglesia.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <RadioGroupItem value="Grupo Específico" id="specific-group" />
                            <div className='flex-1 space-y-2'>
                              <Label htmlFor="specific-group" className="font-semibold">Grupo de Oración Específico</Label>
                              <p className="text-sm text-muted-foreground">Solo visible para los miembros de un grupo seleccionado.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <RadioGroupItem value="Solo Personal" id="staff-only" />
                            <div className='flex-1'>
                              <Label htmlFor="staff-only" className="font-semibold">Solo Personal Pastoral</Label>
                              <p className="text-sm text-muted-foreground">Completamente confidencial, solo visto por los pastores.</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enviar Anónimamente
                        </FormLabel>
                        <FormDescription>
                          Su nombre no se adjuntará a esta petición de oración.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Este submit oculto permite enviar presionando Enter */}
                <button type="submit" className="hidden" />
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
