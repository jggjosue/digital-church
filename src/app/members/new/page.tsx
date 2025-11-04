
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { AppHeader } from '@/components/app-header';

const availableGroups = [
    'Youth Group',
    'Choir',
    'Volunteers',
    'New Members Class',
];


export default function NewMemberPage() {
    const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>();
    const [spiritualBirthday, setSpiritualBirthday] = React.useState<Date | undefined>();
    const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);

    const handleGroupToggle = (group: string) => {
        setSelectedGroups(prev => 
            prev.includes(group) 
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    }

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Añadir Nuevo Miembro"
        description="Ingrese los detalles a continuación para crear un nuevo perfil de miembro."
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/members">Cancelar</Link>
          </Button>
          <Button>Guardar Miembro</Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-8 space-y-8">
          <Card>
              <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Detalles básicos sobre el nuevo miembro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                          <Button variant="outline">Subir Foto</Button>
                          <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF hasta 10MB.</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="first-name">Nombre</Label>
                          <Input id="first-name" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="last-name">Apellido</Label>
                          <Input id="last-name" defaultValue="Doe" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input id="email" type="email" defaultValue="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="phone">Número de Teléfono</Label>
                          <Input id="phone" type="tel" defaultValue="+1 (555) 000-0000" />
                      </div>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" defaultValue="123 Main St, Anytown, USA" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="dob">Fecha de Nacimiento</Label>
                          <Popover>
                              <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateOfBirth && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateOfBirth ? format(dateOfBirth, "PPP") : <span>mm/dd/yyyy</span>}
                              </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                              </PopoverContent>
                          </Popover>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="spiritual-bday">Cumpleaños Espiritual</Label>
                           <Popover>
                              <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !spiritualBirthday && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {spiritualBirthday ? format(spiritualBirthday, "PPP") : <span>mm/dd/yyyy</span>}
                              </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={spiritualBirthday} onSelect={setSpiritualBirthday} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                              </PopoverContent>
                          </Popover>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Familia y Relaciones</CardTitle>
                  <CardDescription>Conecte este miembro con su familia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                      <Label htmlFor="add-family">Añadir Miembro de la Familia</Label>
                      <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="add-family" placeholder="Buscar miembros existentes..." className="pl-9" />
                      </div>
                  </div>
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Avatar>
                              <AvatarImage src="https://picsum.photos/seed/2/40/40" />
                              <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-medium">Jane Doe</p>
                              <p className="text-sm text-muted-foreground">Cónyuge</p>
                          </div>
                      </div>
                      <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Grupos y Ministerios</CardTitle>
                  <CardDescription>Asigne el miembro a grupos relevantes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                      <Label>Asignar a Grupos</Label>
                      <div className="mt-2 space-y-3 rounded-md border p-4 max-h-60 overflow-y-auto">
                          {availableGroups.map(group => (
                              <div key={group} className="flex items-center gap-3">
                                  <Checkbox 
                                      id={group} 
                                      checked={selectedGroups.includes(group)}
                                      onCheckedChange={() => handleGroupToggle(group)}
                                  />
                                  <Label htmlFor={group} className="font-normal">{group}</Label>
                              </div>
                          ))}
                      </div>
                       <p className="text-xs text-muted-foreground mt-2">Puede seleccionar múltiples grupos.</p>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="membership-status">Estado de Membresía</Label>
                      <Select defaultValue="active">
                          <SelectTrigger id="membership-status">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="visitor">Visitante</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </CardContent>
          </Card>
      </main>
    </div>
  );
}
