
'use client';

import * as React from 'react';
import {
  Search,
  Heart,
  Droplet,
  Smile,
  Plus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

const ceremonyData = [
  {
    id: 4,
    type: 'Bautismo',
    icon: Droplet,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
    date: '22 de Octubre, 2023',
    title: 'Bautismo de Emily White',
    details: 'Oficiado por: Pastor David Chen',
  },
  {
    id: 2,
    type: 'Matrimonio',
    icon: Heart,
    iconBgColor: 'bg-pink-100',
    iconColor: 'text-pink-500',
    date: '15 de Septiembre, 2023',
    title: 'Matrimonio de Michael Johnson & Jessica Lee',
    details: 'Testigos: Sarah Brown, Chris Wilson',
  },
  {
    id: 3,
    type: 'Dedicación de Niño',
    icon: Smile,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-500',
    date: '05 de Agosto, 2023',
    title: 'Dedicación de Niño para Olivia Rodriguez',
    details: 'Padres: Liam & Maria Rodriguez',
  },
];

export default function CeremoniesPage() {
  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Registros Históricos"
        description="Busque y vea el archivo de eventos de la iglesia."
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/ceremonies/export">
                <FileText className="mr-2 h-4 w-4" /> Exportar Datos
              </Link>
            </Button>
            <Button asChild>
              <Link href="/ceremonies/new">
                <Plus className="mr-2 h-4 w-4" /> Agregar Ceremonia
              </Link>
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div>
                        <label htmlFor="event-type" className="text-sm font-medium text-muted-foreground">Tipo de Evento</label>
                         <Select>
                            <SelectTrigger id="event-type" className="w-full mt-1">
                            <SelectValue placeholder="Todos los Eventos" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">Todos los Eventos</SelectItem>
                            <SelectItem value="baptism">Bautismo</SelectItem>
                            <SelectItem value="marriage">Matrimonio</SelectItem>
                            <SelectItem value="dedication">Dedicación de Niño</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Rango de Fechas</label>
                        <Input id="date-range" placeholder="1 de Ene, 2023 - 31 de Dic, 2023" className="mt-1" />
                    </div>
                     <div>
                        <label htmlFor="search-person" className="text-sm font-medium text-muted-foreground">Buscar por Persona</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="search-person" placeholder="e.g., John Smith" className="pl-9" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {ceremonyData.map((ceremony, index) => (
                    <div key={index} className="flex items-start gap-4 sm:gap-6">
                        <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${ceremony.iconBgColor}`}>
                                <ceremony.icon className={`h-5 w-5 ${ceremony.iconColor}`} />
                            </div>
                            {index < ceremonyData.length - 1 && (
                                <div className="w-px h-full bg-border mt-2 flex-1"></div>
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <Card>
                                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{ceremony.date}</p>
                                        <h3 className="text-lg font-bold mt-1">{ceremony.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{ceremony.details}</p>
                                    </div>
                                    <Button variant="link" className="p-0 h-auto self-start sm:self-center" asChild>
                                        <Link href={`/events/${ceremony.id}`}>Ver Detalles</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>

        </CardContent>
      </Card>
    </main>
    </div>
  );
}
