
'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ceremonyData } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';

const ceremonyCategoryColors: { [key: string]: string } = {
    'Bautismo': 'bg-blue-100 text-blue-800 border-blue-200',
    'Matrimonio': 'bg-pink-100 text-pink-800 border-pink-200',
    'Dedicación de Niño': 'bg-green-100 text-green-800 border-green-200',
};

export default function CeremonyDetailsPage({ params }: { params: { id: string } }) {
    const ceremony = ceremonyData.find(c => c.id.toString() === params.id);

    if (!ceremony) {
        notFound();
    }

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Detalles de la Ceremonia"
        description={<Link href="/ceremonies" className="text-sm text-muted-foreground hover:underline">Ver todas las ceremonias</Link>}
      >
          <div className="flex gap-2">
            <Button className="w-full" asChild><Link href={`/ceremonies/${ceremony.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Editar</Link></Button>
            <Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
          </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <Card>
            <CardContent className="p-6">
                 <Image
                    src={PlaceHolderImages.find(p => p.id === 'event-bible-study')?.imageUrl || ''}
                    alt={ceremony.title}
                    width={800}
                    height={400}
                    className="rounded-lg object-cover w-full mb-6"
                    data-ai-hint="people celebrating"
                />
                <Badge variant="outline" className={`mt-4 ${ceremonyCategoryColors[ceremony.type]}`}>
                    {ceremony.type}
                </Badge>
                <h2 className="mt-2 text-3xl font-bold">{ceremony.title}</h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <CalendarIcon className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-lg">Fecha y Hora</p>
                            <p className="text-muted-foreground">{ceremony.date}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-lg">Oficiante</p>
                            <p className="text-muted-foreground">{ceremony.details.replace('Oficiado por: ', '')}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

    </main>
    </div>
  );
}
