'use client';

import * as React from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
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
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function NewGroupPage() {
    const [leader, setLeader] = React.useState<{name: string, email: string} | null>({ name: 'Jane Smith', email: 'jane.smith@example.com' });

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Grupo</h1>
          <p className="text-muted-foreground">
            Complete los detalles a continuación para crear un nuevo grupo.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Grupo</CardTitle>
          <CardDescription>
            Proporcione el nombre, la descripción y otra información clave para el nuevo grupo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nombre del Grupo</Label>
            <Input id="group-name" placeholder="Ej., Estudio Bíblico Dominical Matutino" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Proporcione una breve descripción del propósito y las actividades del grupo."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Estudio Bíblico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bible-study">Estudio Bíblico</SelectItem>
                  <SelectItem value="small-group">Grupo Pequeño</SelectItem>
                  <SelectItem value="service-team">Equipo de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Activo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="paused">En Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-leaders">Líder(es) del Grupo</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="group-leaders"
                placeholder="Buscar miembros para añadir como líderes..."
                className="pl-9"
              />
            </div>
            {leader && (
                 <div className="mt-2 flex items-center justify-between rounded-lg border bg-secondary p-2">
                    <div className="flex items-center gap-3">
                        <Avatar className='h-8 w-8'>
                            <AvatarImage src="https://picsum.photos/seed/2/32/32" alt={leader.name} />
                            <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{leader.name}</p>
                            <p className="text-xs text-muted-foreground">{leader.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLeader(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" asChild><Link href="/groups">Cancelar</Link></Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Crear Grupo
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
