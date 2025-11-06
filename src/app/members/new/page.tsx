
'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Trash2,
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
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { AppHeader } from '@/components/app-header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const availableGroups = [
    'Youth Group',
    'Choir',
    'Volunteers',
    'New Members Class',
];

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'El nombre es requerido.' }),
  lastName: z.string().min(1, { message: 'El apellido es requerido.' }),
  email: z.string().email({ message: 'Por favor ingrese un correo electrónico válido.' }).min(1, { message: 'El correo electrónico es requerido.' }),
  phone: z.string().optional(),
  address: z.string().min(1, { message: 'La dirección es requerida.' }),
  dob: z.date().optional(),
  spiritualBirthday: z.date().optional(),
  family: z.array(z.object({ id: z.number(), name: z.string(), relation: z.string() })).optional(),
  groups: z.array(z.string()).optional(),
  membershipStatus: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;


export default function NewMemberPage() {
    const { toast } = useToast();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            groups: [],
            membershipStatus: 'active'
        }
    });

    const handleGroupToggle = (group: string) => {
        const currentGroups = form.getValues('groups') || [];
        const newGroups = currentGroups.includes(group)
            ? currentGroups.filter(g => g !== group)
            : [...currentGroups, group];
        form.setValue('groups', newGroups);
    }
    
    const onSubmit = (values: FormValues) => {
        console.log(values);
        toast({
            title: "Miembro Guardado",
            description: `${values.firstName} ${values.lastName} ha sido agregado exitosamente.`,
        });
    }

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Añadir Nuevo Miembro"
        description="Ingrese los detalles a continuación para crear un nuevo perfil de miembro."
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/members">Cancelar</Link>
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Guardar Miembro</Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-8 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Detalles básicos sobre el nuevo miembro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <Button variant="outline" type="button">Subir Foto</Button>
                            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF hasta 10MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Teléfono</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Nacimiento</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>mm/dd/yyyy</span>}
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="spiritualBirthday"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Cumpleaños Espiritual</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>mm/dd/yyyy</span>}
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Familia y Relaciones</CardTitle>
                  <CardDescription>Conecte este miembro con su familia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                      <Label htmlFor="add-family">Añadir Miembro de la Familia</Label>
                      <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="add-family" placeholder="Buscar miembros existentes..." className="pl-9" />
                      </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                  <CardTitle>Grupos y Ministerios</CardTitle>
                  <CardDescription>Asigne el miembro a grupos relevantes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="groups"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Asignar a Grupos</FormLabel>
                            <div className="mt-2 space-y-3 rounded-md border p-4 max-h-60 overflow-y-auto">
                                {availableGroups.map(group => (
                                    <div key={group} className="flex items-center gap-3">
                                        <Checkbox 
                                            id={group} 
                                            checked={field.value?.includes(group)}
                                            onCheckedChange={() => handleGroupToggle(group)}
                                        />
                                        <Label htmlFor={group} className="font-normal">{group}</Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Puede seleccionar múltiples grupos.</p>
                            <FormMessage />
                        </FormItem>
                    )}
                  />
                   <FormField
                        control={form.control}
                        name="membershipStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado de Membresía</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="visitor">Visitante</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
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

    
