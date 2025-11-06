
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Search,
  Download,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppHeader } from '@/components/app-header';

const personCeremonies = [
    { id: 1, type: 'Matrimonio', date: '15 de Sep, 2023', officiant: 'Pastor David Chen' },
    { id: 2, type: 'Dedicación de Niño', date: '05 de Ago, 2023', officiant: 'Pastor David Chen', details: 'Hijo: Michael Johnson Jr.' },
];

export default function ExportCeremoniesPage() {
    const [selectedPerson, setSelectedPerson] = React.useState({ name: 'Michael Johnson', avatar: 'https://picsum.photos/seed/mj/40/40' });
    const [selectedCeremonies, setSelectedCeremonies] = React.useState<number[]>([]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedCeremonies(checked ? personCeremonies.map(c => c.id) : []);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedCeremonies([...selectedCeremonies, id]);
        } else {
            setSelectedCeremonies(selectedCeremonies.filter(i => i !== id));
        }
    };


  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Exportar Registros de Ceremonias"
        description="Genere un reporte de los eventos de vida de un miembro."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild><Link href="/ceremonies">Cancelar</Link></Button>
            <Button disabled={selectedCeremonies.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF ({selectedCeremonies.length})
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Seleccionar Miembro</CardTitle>
          <CardDescription>
            Busque a la persona para la cual desea exportar los registros de ceremonias.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="search-person" placeholder="Buscar por nombre, email..." className="pl-9" />
                </div>
                 {selectedPerson && (
                    <div className="w-full sm:w-auto flex-shrink-0">
                        <div className="flex items-center gap-3 rounded-lg border bg-secondary p-2">
                             <Avatar>
                                <AvatarImage src={selectedPerson.avatar} alt={selectedPerson.name} />
                                <AvatarFallback>{selectedPerson.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{selectedPerson.name}</p>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
      
      {selectedPerson && (
          <Card className="max-w-4xl mx-auto mt-6">
            <CardHeader>
                <CardTitle>Historial de Ceremonias para {selectedPerson.name}</CardTitle>
                <CardDescription>
                    Seleccione los registros que desea incluir en el reporte.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox 
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    checked={selectedCeremonies.length === personCeremonies.length && personCeremonies.length > 0}
                                />
                            </TableHead>
                            <TableHead>Tipo de Ceremonia</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Oficiante</TableHead>
                            <TableHead>Detalles Adicionales</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {personCeremonies.map((ceremony) => (
                            <TableRow key={ceremony.id}>
                            <TableCell>
                                <Checkbox 
                                    checked={selectedCeremonies.includes(ceremony.id)}
                                    onCheckedChange={(checked) => handleSelectOne(ceremony.id, !!checked)}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{ceremony.type}</TableCell>
                            <TableCell>{ceremony.date}</TableCell>
                            <TableCell>{ceremony.officiant}</TableCell>
                            <TableCell>{ceremony.details || '-'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>
      )}

    </main>
    </div>
  );
}
