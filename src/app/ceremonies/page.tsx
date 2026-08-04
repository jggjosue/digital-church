'use client';

import * as React from 'react';
import {
  Search,
  Heart,
  Droplet,
  Smile,
  Plus,
  FileText,
  Loader2,
  CalendarHeart
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

type Ceremony = {
    id: string;
    type: string;
    date: string;
    participants: string[];
    officiant?: string;
    notes?: string;
    status: string;
};

const getIconForType = (type: string) => {
    switch (type) {
        case 'Bautismo': return { icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-100' };
        case 'Matrimonio': return { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' };
        case 'Dedicación de Niño': return { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' };
        default: return { icon: CalendarHeart, color: 'text-purple-500', bg: 'bg-purple-100' };
    }
};

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = React.useState<Ceremony[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
      fetch('/api/data/ceremonies')
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setCeremonies(data.items);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

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

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-8">
                    {ceremonies.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay ceremonias registradas.
                        </div>
                    )}
                    {ceremonies.map((ceremony, index) => {
                        const style = getIconForType(ceremony.type);
                        const Icon = style.icon;
                        return (
                        <div key={ceremony.id} className="flex items-start gap-4 sm:gap-6">
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${style.bg}`}>
                                    <Icon className={`h-5 w-5 ${style.color}`} />
                                </div>
                                {index < ceremonies.length - 1 && (
                                    <div className="w-px h-full bg-border mt-2 flex-1 min-h-[40px]"></div>
                                )}
                            </div>
                            <div className="flex-1 pb-8">
                                <Card>
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{new Date(ceremony.date).toLocaleDateString('es-ES')}</p>
                                            <h3 className="text-lg font-bold mt-1">{ceremony.type}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Participantes: {ceremony.participants.join(', ')}</p>
                                            {ceremony.officiant && <p className="text-sm text-muted-foreground mt-1">Oficiante: {ceremony.officiant}</p>}
                                        </div>
                                        <Button variant="link" className="p-0 h-auto self-start sm:self-center" asChild>
                                            <Link href={`/ceremonies/${ceremony.id}`}>Ver Detalles</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
