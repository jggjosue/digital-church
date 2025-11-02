'use client';

import * as React from 'react';
import { Plus, Search, ChevronDown, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { rolesData } from '@/lib/data';

type Role = (typeof rolesData)[0];

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


export default function SettingsPage() {
    const [selectedRole, setSelectedRole] = React.useState<Role>(rolesData[0]);

    return (
        <main className="flex-1 bg-muted/20 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Roles y Permisos</h1>
                    <p className="text-muted-foreground">
                        Defina y gestione roles de usuario, asigne permisos y controle los niveles de acceso.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Role List */}
                <div className="lg:col-span-1">
                    <div className='flex flex-col gap-4'>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Rol
                        </Button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar roles..." className="pl-9" />
                        </div>
                        <RadioGroup 
                            defaultValue={selectedRole.name} 
                            className="space-y-1"
                            onValueChange={(value) => setSelectedRole(rolesData.find(r => r.name === value) || rolesData[0])}
                        >
                            {rolesData.map((role) => (
                                <div key={role.id} className={`flex items-center space-x-2 rounded-md p-3 transition-colors ${selectedRole.id === role.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'}`}>
                                    <RadioGroupItem value={role.name} id={`role-${role.id}`} />
                                    <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer flex-1">{role.name}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                {/* Right Column: Role Details & Permissions */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl'>{selectedRole.name}</CardTitle>
                            <CardDescription>
                                {selectedRole.description} {selectedRole.name === 'Super Administrador' && 'Este rol debe asignarse con precaución.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className='font-semibold'>Gestión de Miembros</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4 p-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="select-all-members" />
                                                <label
                                                    htmlFor="select-all-members"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                   Seleccionar Todo
                                                </label>
                                            </div>
                                            {permissions['Gestión de Miembros'].map(perm => (
                                                <div key={perm} className="flex items-center space-x-2">
                                                    <Checkbox id={perm.toLowerCase().replace(/\s/g, '-')} checked={selectedRole.name === 'Super Administrador'}/>
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
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className='font-semibold'>Donaciones y Finanzas</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4 p-4">
                                             <div className="flex items-center space-x-2">
                                                <Checkbox id="select-all-donations" />
                                                <label
                                                    htmlFor="select-all-donations"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                   Seleccionar Todo
                                                </label>
                                            </div>
                                            {permissions['Donaciones y Finanzas'].map(perm => (
                                                <div key={perm} className="flex items-center space-x-2">
                                                    <Checkbox id={perm.toLowerCase().replace(/\s/g, '-')} checked={selectedRole.name === 'Super Administrador'}/>
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
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className='font-semibold'>Configuración del Sistema</AccordionTrigger>
                                    <AccordionContent>
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="select-all-system"/>
                                                <label
                                                    htmlFor="select-all-system"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                   Seleccionar Todo
                                                </label>
                                            </div>
                                            {permissions['Configuración del Sistema'].map(perm => (
                                                <div key={perm} className="flex items-center space-x-2">
                                                    <Checkbox id={perm.toLowerCase().replace(/\s/g, '-')} checked={selectedRole.name === 'Super Administrador'} />
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
                            </Accordion>
                            <div className="mt-8 flex justify-between items-center">
                                <Button variant="link" className="text-destructive p-0 hover:text-destructive/80">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar Rol
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button>Guardar Cambios</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
