'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  name: z.string().min(1, { message: 'El nombre del ministerio es requerido.' }),
  description: z.string().max(8000),
});

type FormValues = z.infer<typeof formSchema>;

const MINISTRY_NEW_FORM_ID = 'ministry-new-form';

export default function NewMinistryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const res = await fetch('/api/ministries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          description: values.description.trim(),
          leaders: [],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        id?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear el ministerio.');
      }
      toast({
        title: 'Ministerio creado',
        description: data.message || `«${values.name}» se guardó en la base de datos.`,
      });
      router.push('/ministries');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: err instanceof Error ? err.message : 'Error al guardar en la base de datos.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Crear Nuevo Ministerio"
        description="Complete los detalles a continuación para establecer un nuevo ministerio."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" asChild>
            <Link href="/ministries">Cancelar</Link>
          </Button>
          <Button type="submit" form={MINISTRY_NEW_FORM_ID} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear Ministerio'}
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 bg-muted/20 p-4 sm:p-8">
        <Form {...form}>
          <form
            id={MINISTRY_NEW_FORM_ID}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <Card className="mx-auto max-w-3xl">
              <CardHeader>
                <CardTitle>Detalles del Ministerio</CardTitle>
                <CardDescription>
                  El nombre es obligatorio; la descripción es opcional. Podrá asignar líderes más
                  adelante desde la edición del ministerio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Ministerio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej., Ministerio de Niños, Equipo de Adoración"
                          {...field}
                        />
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
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa el propósito y las responsabilidades de este ministerio."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}
