'use client';

import * as React from 'react';
import {
  ArrowLeft,
  UserPlus,
  Church,
  Mail,
  UserCog,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function BulkActionsPage() {
    const [selectedCount, setSelectedCount] = React.useState(12);

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Acciones Masivas</h1>
            <p className="text-muted-foreground">
              Realice acciones en varios miembros a la vez.
            </p>
          </div>
        </div>
        <div className="text-lg font-semibold">
          {selectedCount} miembros seleccionados
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assign to Group */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              Asignar a Grupo
            </CardTitle>
            <CardDescription>
              Añada los miembros seleccionados a uno o más grupos existentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un grupo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youth-group">Grupo de Jóvenes</SelectItem>
                <SelectItem value="choir">Coro</SelectItem>
                <SelectItem value="volunteers">Voluntarios</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">Asignar a Grupo</Button>
          </CardContent>
        </Card>

        {/* Assign to Ministry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Church className="h-5 w-5 text-primary" />
              Asignar a Ministerio
            </CardTitle>
            <CardDescription>
              Asigne miembros a un equipo o departamento ministerial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un ministerio..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worship-team">Equipo de Adoración</SelectItem>
                <SelectItem value="community-outreach">Alcance Comunitario</SelectItem>
                <SelectItem value="kids-church">Iglesia de Niños</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">Asignar a Ministerio</Button>
          </CardContent>
        </Card>

        {/* Send Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Enviar Email
            </CardTitle>
            <CardDescription>
              Redacte y envíe un correo electrónico de difusión a todos los miembros seleccionados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Asunto del Correo" />
            <Button className="w-full">Redactar Correo</Button>
          </CardContent>
        </Card>

        {/* Update Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-primary" />
              Actualizar Estado
            </CardTitle>
            <CardDescription>
              Cambie el estado de membresía de los miembros seleccionados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="visitor">Visitante</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">Actualizar Estado</Button>
          </CardContent>
        </Card>

        {/* Delete Members */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <Trash2 className="h-5 w-5" />
              Eliminar Miembros
            </CardTitle>
            <CardDescription>
              Elimine permanentemente los miembros seleccionados del sistema. Esta acción no se puede deshacer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="delete-confirm" />
                <Label htmlFor="delete-confirm" className="text-sm">
                    Entiendo que esta acción es irreversible.
                </Label>
            </div>
            <Button variant="destructive" className="w-full">
              Eliminar {selectedCount} Miembros
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
