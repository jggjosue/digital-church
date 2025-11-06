
'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const locations = [
  {
    id: 1,
    name: 'Main Campus - Downtown',
    address: '123 Main St, Los Angeles, CA 90012',
    phone: '(213) 555-0182',
    imageUrl: PlaceHolderImages.find(p => p.id === 'event-bible-study')?.imageUrl || 'https://picsum.photos/seed/loc1/800/600',
    imageHint: 'modern church building'
  },
  {
    id: 2,
    name: 'North Valley Campus',
    address: '456 Oak Ave, San Fernando, CA 91340',
    phone: '(818) 555-0145',
    imageUrl: 'https://picsum.photos/seed/loc2/800/600',
    imageHint: 'suburban church exterior'
  },
  {
    id: 3,
    name: 'South Bay Campus',
    address: '789 Pine Ln, Torrance, CA 90501',
    phone: '(310) 555-0199',
    imageUrl: 'https://picsum.photos/seed/loc3/800/600',
    imageHint: 'church with palm trees'
  },
  {
    id: 4,
    name: 'Eastside Community Church',
    address: '101 Maple Dr, Riverside, CA 92507',
    phone: '(951) 555-0133',
    imageUrl: 'https://picsum.photos/seed/loc4/800/600',
    imageHint: 'community church entrance'
  },
  {
    id: 5,
    name: 'Austin Central Campus',
    address: '202 Congress Ave, Austin, TX 78701',
    phone: '(512) 555-0176',
    imageUrl: 'https://picsum.photos/seed/loc5/800/600',
    imageHint: 'city church building'
  },
];

export default function ChurchesPage() {
  const [selectedLocation, setSelectedLocation] = React.useState(locations[0]);

  return (
    <div className="flex flex-col flex-1 h-screen">
      <AppHeader
        title="Ubicaciones de la Iglesia"
        description="Gestione y vea las ubicaciones geográficas de su iglesia."
      >
        <Button asChild>
          <Link href="/churches/new">
            <Plus className="mr-2 h-4 w-4" /> Añadir Ubicación
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-96 border-b md:border-r md:border-b-0">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className='space-y-1'>
                    <label htmlFor='country-select' className='text-sm font-medium text-muted-foreground'>País</label>
                    <Select>
                        <SelectTrigger id='country-select'>
                            <SelectValue placeholder="Todos los Países" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Países</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-1'>
                    <label htmlFor='state-select' className='text-sm font-medium text-muted-foreground'>Estado</label>
                    <Select>
                        <SelectTrigger id='state-select'>
                            <SelectValue placeholder="Todos los Estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o dirección..." className="pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {locations.map((location) => (
                    <div
                        key={location.id}
                        className={cn(
                        'p-4 cursor-pointer border-t',
                        selectedLocation.id === location.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                        )}
                        onClick={() => setSelectedLocation(location)}
                    >
                        <h3 className={cn('font-semibold', selectedLocation.id === location.id && 'text-primary')}>{location.name}</h3>
                        <p className="text-sm">{location.address}</p>
                        <p className="text-sm text-muted-foreground">{location.phone}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex-1 bg-muted/20 relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
          ></iframe>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8">
                <Card className="w-80 bg-background/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg">{selectedLocation.name}</h3>
                        <p className="text-sm mt-1">{selectedLocation.address}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedLocation.phone}</p>
                        <Link href={`/churches/${selectedLocation.id}`} className="text-sm font-medium text-black dark:text-white mt-4 inline-block hover:underline">Ver Detalles</Link>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
