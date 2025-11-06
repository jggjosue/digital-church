
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

export default function NewChurchPage() {
  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Añadir Nueva Ubicación"
        description="Rellene los detalles a continuación para registrar un nuevo campus de la iglesia."
      >
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/churches">Cancelar</Link>
            </Button>
            <Button>Guardar Ubicación</Button>
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
              <Input id="location-name" placeholder="Ej., Campus del Valle Norte" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="123 Calle Principal" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Los Ángeles" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="CA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código Postal</Label>
                <Input id="zip" placeholder="90012" />
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select>
                    <SelectTrigger id="country">
                        <SelectValue placeholder="Seleccione un país" />
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
                <Input id="phone" placeholder="(123) 456-7890" />
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
                <Input id="campus-pastor" placeholder="Nombre del pastor principal del campus" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contacto</Label>
                <Input id="contact-email" type="email" placeholder="campus.principal@ejemplo.com" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Descripción del Campus</Label>
                <Textarea id="description" placeholder="Proporcione una breve descripción de este campus, sus servicios o su comunidad." />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

