
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Lock,
  Globe,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppHeader } from '@/components/app-header';

export default function NewPrayerRequestPage() {

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Nueva Petición de Oración"
        description="Comparta sus necesidades de oración con la comunidad."
      >
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Enviar Petición</Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-8 bg-muted/20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles de la Petición de Oración</CardTitle>
          <CardDescription>
            Por favor, proporcione tantos detalles como se sienta cómodo compartiendo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ej., Sanidad para un ser querido" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Comparta más detalles sobre su petición de oración..."
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label>Configuración de Privacidad</Label>
            <p className="text-sm text-muted-foreground">
                Elija quién puede ver su petición de oración.
            </p>
            <RadioGroup defaultValue="public" className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <RadioGroupItem value="public" id="public" />
                <div className="flex-1">
                  <Label htmlFor="public" className="font-semibold">Público</Label>
                  <p className="text-sm text-muted-foreground">Visible para todos los miembros de la iglesia.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <RadioGroupItem value="specific-group" id="specific-group" />
                <div className='flex-1 space-y-2'>
                  <Label htmlFor="specific-group" className="font-semibold">Grupo de Oración Específico</Label>
                  <p className="text-sm text-muted-foreground">Solo visible para los miembros de un grupo seleccionado.</p>
                   <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grupo-oracion-1">Grupo de Oración 1</SelectItem>
                      <SelectItem value="grupo-oracion-2">Grupo de Oración 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <RadioGroupItem value="staff-only" id="staff-only" />
                <div className='flex-1'>
                  <Label htmlFor="staff-only" className="font-semibold">Solo Personal Pastoral</Label>
                  <p className="text-sm text-muted-foreground">Completamente confidencial, solo visto por los pastores.</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="anonymous" />
            <Label htmlFor="anonymous" className="leading-none">
                Enviar Anónimamente
                <p className="text-xs text-muted-foreground mt-1">Su nombre no se adjuntará a esta petición de oración.</p>
            </Label>
          </div>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
