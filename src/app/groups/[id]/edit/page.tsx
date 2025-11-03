'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { groupData } from '@/lib/data';

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const group = groupData.find(g => g.id.toString() === params.id) || groupData[0];
  const [leader, setLeader] = React.useState<{ name: string; email: string } | null>({ name: 'Jane Smith', email: 'jane.smith@example.com' });

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Grupo</h1>
          <p className="text-muted-foreground">
            Modifique los detalles del &quot;{group.name}&quot;.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/groups">Cancelar</Link>
            </Button>
            <Button>Guardar Cambios</Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nombre del Grupo</Label>
            <Input id="group-name" defaultValue={group.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              defaultValue={group.description}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Tipo / Categoría de Grupo</Label>
              <Select defaultValue="youth">
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youth">Jóvenes</SelectItem>
                  <SelectItem value="bible-study">Estudio Bíblico</SelectItem>
                  <SelectItem value="small-group">Grupo Pequeño</SelectItem>
                  <SelectItem value="service-team">Equipo de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado del Grupo</Label>
              <Select defaultValue={group.status.toLowerCase()}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="en pausa">En Pausa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-leaders">Líder(es) del Grupo</Label>
            <div className="min-h-10 rounded-md border border-input p-2 flex flex-wrap gap-2 items-center">
                 {leader && (
                    <Badge variant="secondary" className="flex items-center gap-1.5 py-1 text-sm">
                        <span>{leader.name}</span>
                        <button onClick={() => setLeader(null)} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
                <div className="relative flex-grow">
                    <Input 
                        id="group-leaders-input"
                        placeholder="Buscar y añadir líderes..."
                        className="border-none focus-visible:ring-0 shadow-none h-auto py-0 px-1"
                    />
                </div>
            </div>
             <p className="text-sm text-destructive">Se requiere al menos un líder de grupo.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-6">
            <Button variant="outline" asChild><Link href="/groups">Cancelar</Link></Button>
            <Button>Guardar Cambios</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
