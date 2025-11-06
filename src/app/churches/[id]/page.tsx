
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const locationDetails = {
    id: 1,
    name: 'Main Campus - Downtown',
    address: '123 Main St, Los Angeles, CA 90012',
    phone: '(213) 555-0182',
    email: 'downtown@gracechurch.org',
    campusPastor: 'Pastor John Smith',
    description: 'Our main campus located in the heart of the city, serving as a hub for our community outreach and primary worship services. We have programs for all ages and a vibrant congregation.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'event-bible-study')?.imageUrl || 'https://picsum.photos/seed/main-campus/1200/500',
    imageHint: 'large church interior worship'
};

export default function ChurchDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch data based on params.id
  const location = locationDetails;

  return (
    <AlertDialog>
        <div className="flex flex-col flex-1">
        <AppHeader
            title={location.name}
            description={location.address}
        >
            <div className="flex gap-2">
                <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
                </AlertDialogTrigger>
                <Button><Edit className="mr-2 h-4 w-4"/>Editar Ubicación</Button>
            </div>
        </AppHeader>
        <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
                <div className="relative h-64 w-full">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                    ></iframe>
                </div>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold mb-4">Acerca de este Campus</h2>
                            <p className="text-muted-foreground">{location.description}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Información Clave</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Pastor del Campus</p>
                                        <p className="font-medium">{location.campusPastor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Teléfono</p>
                                        <p className="font-medium">{location.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{location.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Dirección</p>
                                        <p className="font-medium">{location.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        </main>
        </div>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className='text-center'>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className='text-center'>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la ubicación.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirmar Eliminación</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
