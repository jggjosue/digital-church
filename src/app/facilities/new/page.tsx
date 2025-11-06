
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Plus,
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
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/app-header';
import { Checkbox } from '@/components/ui/checkbox';

const amenities = [
    'Sistema AV', 'Proyector', 'Pizarra Blanca', 'Wi-Fi', 'Aire Acondicionado', 'Cocina Pequeña', 'Escenario', 'Iluminación Ajustable'
];

export default function NewFacilityPage() {

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Registrar Nuevo Salón"
        description="Complete los detalles a continuación para agregar un nuevo espacio a sus instalaciones."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild><Link href="/facilities">Cancelar</Link></Button>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Guardar Salón
            </Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Detalles del Salón</CardTitle>
                <CardDescription>
                    Proporcione información sobre el nuevo salón o sala.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="room-name">Nombre del Salón</Label>
                    <Input id="room-name" placeholder="Ej., Salón Comunitario, Sala de Oración B" />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacidad</Label>
                        <Input id="capacity" type="number" placeholder="Ej., 50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Seleccionar una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sanctuary">Santuario</SelectItem>
                                <SelectItem value="hall">Salón</SelectItem>
                                <SelectItem value="classroom">Aula</SelectItem>
                                <SelectItem value="office">Oficina</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input id="location" placeholder="Ej., Edificio Principal, Sótano" />
                </div>
                <div className="space-y-2">
                    <Label>Comodidades</Label>
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                        {amenities.map(amenity => (
                            <div key={amenity} className="flex items-center gap-2">
                                <Checkbox id={amenity.toLowerCase().replace(' ', '-')} />
                                <Label htmlFor={amenity.toLowerCase().replace(' ', '-')} className="font-normal">{amenity}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notas (Opcional)</Label>
                    <Textarea id="notes" placeholder="Añada cualquier detalle o instrucción adicional sobre este salón." />
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
