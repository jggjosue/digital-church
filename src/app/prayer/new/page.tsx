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
import { Loader2, Plus, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type PrayerGroup = {
  id: string;
  name: string;
  description?: string;
};

export default function NewPrayerRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [groups, setGroups] = React.useState<PrayerGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = React.useState(false);

  // Modal para agregar un nuevo grupo
  const [isAddGroupOpen, setIsAddGroupOpen] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDesc, setNewGroupDesc] = React.useState('');
  const [isCreatingGroup, setIsCreatingGroup] = React.useState(false);

  const form = useForm<CreatePrayerInput>({
    resolver: zodResolver(createPrayerSchema),
    defaultValues: {
      title: '',
      description: '',
      privacy: 'Público',
      targetGroupId: '',
      targetGroupName: '',
      isAnonymous: false,
    },
  });

  const selectedPrivacy = form.watch('privacy');
  const selectedGroupId = form.watch('targetGroupId');

  // Cargar grupos de oración disponibles
  const loadGroups = React.useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch('/api/prayer/groups');
      const data = await res.json();
      if (res.ok && Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Error al cargar grupos de oración:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  React.useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Manejar creación de un nuevo grupo de oración
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Campo incompleto',
        description: 'Ingrese el nombre del nuevo grupo de oración.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingGroup(true);
    try {
      const res = await fetch('/api/prayer/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear el grupo.');
      }

      toast({
        title: 'Grupo creado',
        description: `El grupo "${data.group.name}" se creó correctamente.`,
      });

      setNewGroupName('');
      setNewGroupDesc('');
      setIsAddGroupOpen(false);

      // Recargar lista y seleccionar el grupo recién creado
      await loadGroups();
      form.setValue('targetGroupId', data.group.id);
      form.setValue('targetGroupName', data.group.name);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el grupo.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const onSubmit = async (values: CreatePrayerInput) => {
    if (values.privacy === 'Grupo Específico' && !values.targetGroupId) {
      toast({
        title: 'Seleccione un grupo',
        description: 'Por favor seleccione o agregue un grupo de oración específico.',
        variant: 'destructive',
      });
      return;
    }

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
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (val !== 'Grupo Específico') {
                              form.setValue('targetGroupId', '');
                              form.setValue('targetGroupName', '');
                            }
                          }}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <RadioGroupItem value="Público" id="public" />
                            <div className="flex-1">
                              <Label htmlFor="public" className="font-semibold cursor-pointer">Público</Label>
                              <p className="text-sm text-muted-foreground">Visible para todos los miembros de la iglesia.</p>
                            </div>
                          </div>

                          <div className="flex flex-col rounded-lg border p-4 space-y-3">
                            <div className="flex items-start gap-4">
                              <RadioGroupItem value="Grupo Específico" id="specific-group" />
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="specific-group" className="font-semibold cursor-pointer">
                                  Grupo de Oración Específico
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Solo visible para los miembros de un grupo seleccionado.
                                </p>
                              </div>
                            </div>

                            {field.value === 'Grupo Específico' && (
                              <div className="pt-2 pl-8 space-y-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <div className="flex-1">
                                    <Select
                                      value={selectedGroupId}
                                      onValueChange={(val) => {
                                        const group = groups.find((g) => g.id === val);
                                        form.setValue('targetGroupId', val);
                                        form.setValue('targetGroupName', group?.name || '');
                                      }}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue
                                          placeholder={
                                            loadingGroups
                                              ? 'Cargando grupos...'
                                              : 'Seleccionar un grupo de oración...'
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {groups.map((group) => (
                                          <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" type="button" className="shrink-0 gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        <span>Agregar grupo</span>
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Crear Nuevo Grupo de Oración</DialogTitle>
                                        <DialogDescription>
                                          Agregue un grupo de oración si el que necesita no se encuentra en la lista.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="group-name">Nombre del Grupo</Label>
                                          <Input
                                            id="group-name"
                                            placeholder="Ej. Grupo de Jóvenes, Matrimonios..."
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="group-desc">Descripción (opcional)</Label>
                                          <Input
                                            id="group-desc"
                                            placeholder="Breve propósito del grupo..."
                                            value={newGroupDesc}
                                            onChange={(e) => setNewGroupDesc(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          type="button"
                                          onClick={() => setIsAddGroupOpen(false)}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          type="button"
                                          disabled={isCreatingGroup}
                                          onClick={handleCreateGroup}
                                        >
                                          {isCreatingGroup && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          )}
                                          Crear y Seleccionar
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                                {selectedGroupId && (
                                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    Grupo seleccionado: {form.watch('targetGroupName')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-start gap-4 rounded-lg border p-4">
                            <RadioGroupItem value="Solo Personal" id="staff-only" />
                            <div className="flex-1">
                              <Label htmlFor="staff-only" className="font-semibold cursor-pointer">Solo Personal Pastoral</Label>
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
                        <FormLabel className="cursor-pointer">
                          Enviar Anónimamente
                        </FormLabel>
                        <FormDescription>
                          Su nombre no se adjuntará a esta petición de oración.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <button type="submit" className="hidden" />
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
