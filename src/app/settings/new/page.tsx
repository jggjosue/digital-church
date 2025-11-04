
'use client';

import * as React from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';

const permissions = {
    'Gestión de Miembros': [
        'Ver Miembros',
        'Crear Miembros',
        'Editar Miembros',
        'Eliminar Miembros',
        'Exportar Datos',
    ],
    'Donaciones y Finanzas': [
        'Ver Donaciones',
        'Ingresar Donaciones',
        'Gestionar Promesas',
        'Generar Estados de Cuenta',
    ],
    'Configuración del Sistema': [
        'Gestionar Roles',
        'Gestionar Configuración General',
        'Gestionar Integraciones',
    ],
};


export default function NewRolePage() {

    return (
        <div className="flex flex-col flex-1">
            <AppHeader
                title="Crear Nuevo Rol"
                description="Defina un nuevo rol de usuario y configure sus permisos."
            >
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild><Link href="/settings">Cancelar</Link></Button>
                    <Button>Crear Rol</Button>
                </div>
            </AppHeader>
            <main className="flex-1 bg-muted/20 p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl'>Detalles del Rol</CardTitle>
                            <CardDescription>
                                Proporcione un nombre y una breve descripción para este nuevo rol.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role-name">Nombre del Rol</Label>
                                <Input id="role-name" placeholder="Ej., Administrador de Contenido" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role-description">Descripción del Rol</Label>
                                <Textarea id="role-description" placeholder="Describa lo que los usuarios con este rol pueden hacer." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='mt-6'>
                            <CardHeader>
                                <CardTitle className='text-2xl'>Permisos</CardTitle>
                                <CardDescription>
                                    Seleccione los permisos para este rol.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                                    {Object.entries(permissions).map(([category, perms], index) => (
                                        <AccordionItem key={category} value={`item-${index + 1}`}>
                                            <AccordionTrigger className='font-semibold'>{category}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid grid-cols-2 gap-4 p-4">
                                                    <div className="flex items-center space-x-2 col-span-2">
                                                        <Checkbox id={`select-all-${category.toLowerCase().replace(/\s/g, '-')}`} />
                                                        <label
                                                            htmlFor={`select-all-${category.toLowerCase().replace(/\s/g, '-')}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                        Seleccionar Todo
                                                        </label>
                                                    </div>
                                                    {perms.map(perm => (
                                                        <div key={perm} className="flex items-center space-x-2">
                                                            <Checkbox id={perm.toLowerCase().replace(/\s/g, '-')} />
                                                            <label
                                                                htmlFor={perm.toLowerCase().replace(/\s/g, '-')}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {perm}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                </div>
            </main>
        </div>
    );
}
