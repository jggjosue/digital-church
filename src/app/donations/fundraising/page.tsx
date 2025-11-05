
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Edit, FileText } from 'lucide-react';
import { fundraisingCampaigns } from '@/lib/data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

const statusColors: { [key: string]: string } = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

const progressColors: { [key: string]: string } = {
    Active: 'bg-blue-500',
    Completed: 'bg-green-500',
    Upcoming: 'bg-gray-300',
};

export default function FundraisingPage() {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Campañas de Recaudación de Fondos"
        description="Cree y gestione sus campañas de recaudación de fondos."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Crear Campaña
        </Button>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar campañas..." className="pl-9" />
        </div>
        <Select>
            <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder="Todos los Estados" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="upcoming">Próximo</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundraisingCampaigns.map((campaign) => (
            <Card key={campaign.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <Badge variant="outline" className={cn(statusColors[campaign.status])}>{campaign.status}</Badge>
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    {campaign.status !== 'Draft' && (
                        <>
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-bold text-xl">{formatCurrency(campaign.raised)}</span>
                                <span className="text-sm text-muted-foreground">/ {formatCurrency(campaign.goal)}</span>
                            </div>
                            <Progress value={campaign.progress} className={cn('[&>div]:bg-primary', progressColors[campaign.status as keyof typeof progressColors])} />
                            <p className={cn("text-sm mt-1 font-medium", campaign.progress > 100 ? 'text-green-600' : 'text-foreground' )}>{campaign.progress}% Recaudado {campaign.progress > 100 && '- ¡Meta Superada!'}</p>
                        </>
                    )}
                    {campaign.status === 'Draft' && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground font-semibold">No Iniciado</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-muted-foreground pt-4 gap-4 sm:gap-2">
                    {campaign.status !== 'Draft' && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {campaign.status === 'Completed' ? 'Finalizó' : (campaign.status === 'Upcoming' ? 'Comienza' : 'Termina')} {campaign.date}
                            </span>
                        </div>
                    )}
                     {campaign.status === 'Draft' && (
                        <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4"/>
                            Establecer Fechas
                        </Button>
                    )}
                    
                    {campaign.status === 'Completed' && <Button variant="link" asChild className="p-0 h-auto"><Link href="#">Ver Reporte</Link></Button>}
                    {campaign.status === 'Active' && <Button variant="link" asChild className="p-0 h-auto"><Link href="#">Ver Detalles</Link></Button>}
                    {campaign.status === 'Upcoming' && <Button variant="link" asChild className="p-0 h-auto"><Link href="#">Ver Detalles</Link></Button>}
                    {campaign.status === 'Draft' && <Button variant="link" asChild className="p-0 h-auto"><Link href="#">Editar Borrador</Link></Button>}
                </CardFooter>
            </Card>
        ))}
      </div>

    </main>
    </div>
  );
}
