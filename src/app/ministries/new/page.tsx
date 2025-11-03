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
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewMinistryPage() {
  const [leaders, setLeaders] = React.useState([
    { name: 'John Doe', email: 'john.doe@example.com', avatar: 'https://picsum.photos/seed/1/32/32' },
  ]);

  const removeLeader = (email: string) => {
    setLeaders(leaders.filter(leader => leader.email !== email));
  };

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/ministries">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Ministerio</h1>
          <p className="text-muted-foreground">
            Complete los detalles a continuación para establecer un nuevo ministerio.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Ministerio</CardTitle>
          <CardDescription>
            Proporcione un nombre, descripción y designe líderes para el nuevo ministerio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ministry-name">Nombre del Ministerio</Label>
            <Input id="ministry-name" placeholder="Ej., Ministerio de Niños, Equipo de Adoración" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describa el propósito y las responsabilidades de este ministerio."
              rows={4}
            />
          </div>
          <div className="space-y-2">
              <Label htmlFor="category">Categoría del Ministerio</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Alcance Comunitario</SelectItem>
                  <SelectItem value="worship">Adoración</SelectItem>
                  <SelectItem value="youth">Jóvenes</SelectItem>
                  <SelectItem value="children">Niños</SelectItem>
                  <SelectItem value="care">Cuidado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div className="space-y-2">
            <Label htmlFor="ministry-leaders">Líder(es) del Ministerio</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="ministry-leaders"
                placeholder="Buscar miembros para añadir como líderes..."
                className="pl-9"
              />
            </div>
            <div className="space-y-2 mt-2">
                {leaders.map((leader) => (
                    <div key={leader.email} className="flex items-center justify-between rounded-lg border bg-secondary p-2">
                        <div className="flex items-center gap-3">
                            <Avatar className='h-8 w-8'>
                                <AvatarImage src={leader.avatar} alt={leader.name} />
                                <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{leader.name}</p>
                                <p className="text-xs text-muted-foreground">{leader.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLeader(leader.email)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" asChild><Link href="/ministries">Cancelar</Link></Button>
            <Button>Crear Ministerio</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
