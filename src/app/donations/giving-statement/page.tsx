'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  FileText,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function GivingStatementPage() {
  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Generar Estados de Cuenta de Donaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Cree y distribuya estados de cuenta de donaciones para sus miembros.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <Select defaultValue="last-year">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-year">Año Pasado (2023)</SelectItem>
                      <SelectItem value="this-year">Este Año (2024)</SelectItem>
                      <SelectItem value="custom">Rango Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Donantes</Label>
                  <Input placeholder="Todos los Donantes" />
                   <p className="text-xs text-muted-foreground">
                    Busque por nombre o déjelo en blanco para todos.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Fondos</Label>
                  <Select defaultValue="all-funds">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-funds">Todos los Fondos</SelectItem>
                      <SelectItem value="general">Fondo General</SelectItem>
                      <SelectItem value="building">Fondo de Construcción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Formato del Estado de Cuenta</Label>
                  <RadioGroup defaultValue="individual" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="font-normal">Estado de Cuenta Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="family" id="family" />
                      <Label htmlFor="family" className="font-normal">Estado de Cuenta Familiar</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary" className="font-normal">Solo Resumen</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vista Previa del Estado de Cuenta</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>1 de 124</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-8 bg-muted/30">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Grace Chapel</h2>
                                <p className="text-muted-foreground">Declaración de Donación Oficial</p>
                            </div>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src="https://picsum.photos/seed/logo/48/48" />
                                <AvatarFallback>GC</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="mb-8">
                            <p className="font-semibold">John & Jane Smith</p>
                            <p className="text-sm text-muted-foreground">123 Main St</p>
                            <p className="text-sm text-muted-foreground">Anytown, USA 12345</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                            <div>
                                <p className="text-muted-foreground">Fecha del Estado de Cuenta:</p>
                                <p className="font-medium">15 de Enero, 2024</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Período de Donación:</p>
                                <p className="font-medium">1 de Enero, 2023 - 31 de Diciembre, 2023</p>
                            </div>
                        </div>

                        <div className="border-t pt-6 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-medium">Contribuciones Totales para 2023:</p>
                                <p className="text-2xl font-bold">$1,850.00</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Descargar Todo</Button>
                <Button variant="outline"><Mail className="mr-2 h-4 w-4" />Enviar Todo por Correo</Button>
                <Button><FileText className="mr-2 h-4 w-4" />Generar Estados de Cuenta</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
