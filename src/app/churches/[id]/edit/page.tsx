
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
import { AppHeader } from '@/components/app-header';
import { notFound } from 'next/navigation';

const locationDetails = {
    id: 1,
    name: 'Main Campus - Downtown',
    address: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90012',
    country: 'usa',
    phone: '(213) 555-0182',
    email: 'downtown@gracechurch.org',
    campusPastor: 'Pastor John Smith',
    description: 'Our main campus located in the heart of the city, serving as a hub for our community outreach and primary worship services. We have programs for all ages and a vibrant congregation.',
};

export default function EditChurchPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch data based on params.id
  const location = locationDetails;
    
  if (!location) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Editar Ubicación"
        description={`Modificando los detalles de "${location.name}"`}
      >
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href={`/churches/${params.id}`}>Cancelar</Link>
            </Button>
            <Button>Guardar Cambios</Button>
        </div>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Información de la Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location-name">Nombre de la Ubicación</Label>
              <Input id="location-name" defaultValue={location.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" defaultValue={location.address} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" defaultValue={location.city} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" defaultValue={location.state} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código Postal</Label>
                <Input id="zip" defaultValue={location.zip} />
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select defaultValue={location.country}>
                    <SelectTrigger id="country">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="usa">Estados Unidos</SelectItem>
                        <SelectItem value="canada">Canadá</SelectItem>
                        <SelectItem value="mexico">México</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono</Label>
                <Input id="phone" defaultValue={location.phone} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles del Campus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="campus-pastor">Pastor del Campus</Label>
                <Input id="campus-pastor" defaultValue={location.campusPastor} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contacto</Label>
                <Input id="contact-email" type="email" defaultValue={location.email} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Descripción del Campus</Label>
                <Textarea id="description" defaultValue={location.description} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
