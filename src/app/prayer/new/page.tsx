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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function NewPrayerRequestPage() {
  const [isAnonymous, setIsAnonymous] = React.useState(false);

  return (
    <main className="flex-1 space-y-6 p-8 bg-muted/20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/prayer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nueva Petición de Oración
          </h1>
          <p className="text-muted-foreground">
            Comparta una nueva petición de oración con la comunidad de la iglesia.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles de la Petición</CardTitle>
          <CardDescription>
            Complete los detalles de su petición a continuación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ej., Sanidad para un familiar" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describa su petición en detalle. Incluya cualquier información relevante que ayude a otros a orar específicamente."
              rows={5}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous">Enviar Anónimamente</Label>
          </div>

          {!isAnonymous && (
            <div className="space-y-2">
              <Label htmlFor="name">Su Nombre</Label>
              <Input id="name" placeholder="John Doe" disabled />
            </div>
          )}

          <div className="space-y-3">
            <Label>Visibilidad</Label>
            <RadioGroup defaultValue="public" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="public" id="public" className="peer sr-only" />
                <Label
                  htmlFor="public"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                    <Globe className="mb-3 h-6 w-6" />
                    Público
                    <p className="text-xs text-muted-foreground text-center mt-1">Visible para todos en la iglesia.</p>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="staff-only" id="staff-only" className="peer sr-only" />
                <Label
                  htmlFor="staff-only"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                    <Lock className="mb-3 h-6 w-6" />
                    Solo Personal
                    <p className="text-xs text-muted-foreground text-center mt-1">Solo visible para los pastores y el personal.</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Enviar Petición</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
