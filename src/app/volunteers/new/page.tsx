
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const availableSkills = [
    'Cuidado de Niños', 'Liderazgo', 'Oratoria', 'Música (Voz)', 'Música (Instrumento)',
    'Producción de Audio/Video', 'Hospitalidad', 'Enseñanza', 'Manualidades', 'Primeros Auxilios'
];

export default function NewVolunteerPage() {

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className='flex items-center gap-4'>
            <Button variant="outline" size="icon" asChild>
                <Link href="/volunteers"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
            <h1 className="text-3xl font-bold tracking-tight">
                Agregar Nuevo Voluntario
            </h1>
            <p className="text-muted-foreground">
                Ingrese los detalles a continuación para crear un nuevo perfil de voluntario.
            </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/volunteers">Cancelar</Link>
          </Button>
          <Button>Guardar Voluntario</Button>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
          <Card>
              <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Detalles básicos sobre el nuevo voluntario.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="first-name">Nombre</Label>
                          <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="last-name">Apellido</Label>
                          <Input id="last-name" placeholder="Doe" />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input id="email" type="email" placeholder="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="phone">Número de Teléfono</Label>
                          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                  </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Roles, Habilidades y Disponibilidad</CardTitle>
                  <CardDescription>Información para ayudar a programar y asignar al voluntario.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="primary-role">Rol Principal</Label>
                        <Select>
                            <SelectTrigger id="primary-role">
                                <SelectValue placeholder="Seleccione un rol principal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="youth_leader">Líder de Grupo de Jóvenes</SelectItem>
                                <SelectItem value="av_tech">Técnico de AV</SelectItem>
                                <SelectItem value="worship_team">Equipo de Adoración</SelectItem>
                                <SelectItem value="greeter">Anfitrión</SelectItem>
                                <SelectItem value="kids_ministry">Ministerio de Niños</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Habilidades e Intereses</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4">
                        {availableSkills.map(skill => (
                            <div key={skill} className="flex items-center gap-2">
                                <Checkbox id={`skill-${skill}`} />
                                <Label htmlFor={`skill-${skill}`} className="font-normal">{skill}</Label>
                            </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Disponibilidad General</Label>
                        <Textarea placeholder="Describa la disponibilidad del voluntario (ej., Domingos por la mañana, Miércoles por la noche, eventos especiales, etc.)" />
                    </div>
                     <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox id="background-check" />
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="background-check">Verificación de Antecedentes Completada</Label>
                            <p className="text-sm text-muted-foreground">
                                Marque esta casilla si el voluntario ha pasado la verificación de antecedentes requerida.
                            </p>
                        </div>
                    </div>
              </CardContent>
          </Card>
      </div>
    </main>
  );
}
