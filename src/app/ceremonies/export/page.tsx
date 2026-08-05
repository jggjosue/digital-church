'use client';

import * as React from 'react';
import {
  Search,
  Download,
  Loader2,
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
import { AppHeader } from '@/components/app-header';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Ceremony = {
    id: string;
    type: string;
    date: string;
    participants: string[];
    officiant?: string;
    notes?: string;
    status: string;
};

type FormattedCeremony = {
    id: string;
    person: string;
    type: string;
    date: string;
    officiant: string;
    details: string;
};

export default function ExportCeremoniesPage() {
    const [allCeremonies, setAllCeremonies] = React.useState<FormattedCeremony[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filteredCeremonies, setFilteredCeremonies] = React.useState<FormattedCeremony[]>([]);
    const [selectedCeremonies, setSelectedCeremonies] = React.useState<string[]>([]);

    React.useEffect(() => {
        fetch('/api/data/ceremonies')
            .then(res => res.json())
            .then(data => {
                if (data.items) {
                    const formatted = data.items.map((c: Ceremony) => ({
                        id: c.id,
                        person: c.participants.join(', '),
                        type: c.type,
                        date: new Date(c.date).toLocaleDateString('es-ES'),
                        officiant: c.officiant || 'N/A',
                        details: c.notes || 'N/A'
                    }));
                    setAllCeremonies(formatted);
                    setFilteredCeremonies(formatted);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    React.useEffect(() => {
        const results = allCeremonies.filter(ceremony =>
            ceremony.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ceremony.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ceremony.officiant.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCeremonies(results);
    }, [searchTerm, allCeremonies]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedCeremonies(checked ? filteredCeremonies.map(c => c.id) : []);
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedCeremonies([...selectedCeremonies, id]);
        } else {
            setSelectedCeremonies(selectedCeremonies.filter(i => i !== id));
        }
    };
    
    const generatePDF = () => {
        const doc = new jsPDF();
        const selectedData = allCeremonies.filter(c => selectedCeremonies.includes(c.id));
        
        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Certificado de Ceremonia', 105, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Otorgado por Grace Chapel', 105, 30, { align: 'center' });

        // Church Logo (Placeholder)
        doc.rect(15, 15, 20, 20);
        doc.text('Logo', 25, 27, { align: 'center'});

        doc.setLineWidth(0.5);
        doc.line(15, 40, 195, 40);

        // Body
        doc.setFontSize(12);
        doc.text(`Este certificado confirma la participación en la(s) siguiente(s) ceremonia(s) sagrada(s):`, 15, 50);

        autoTable(doc, {
            startY: 55,
            head: [['Participante', 'Tipo de Ceremonia', 'Fecha', 'Oficiante', 'Detalles']],
            body: selectedData.map(c => [c.person, c.type, c.date, c.officiant, c.details]),
            theme: 'striped',
            headStyles: { fillColor: [33, 150, 243] },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 120;

        // Footer
        doc.line(15, finalY + 20, 75, finalY + 20);
        doc.text('Firma del Pastor', 45, finalY + 25, { align: 'center' });
        
        doc.line(135, finalY + 20, 195, finalY + 20);
        doc.text('Fecha de Emisión', 165, finalY + 25, { align: 'center'});
        doc.text(new Date().toLocaleDateString('es-ES'), 165, finalY + 30, { align: 'center'});

        doc.save(`certificado_ceremonias.pdf`);
    };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Exportar Registros de Ceremonias"
        description="Genere un reporte de los eventos de vida de un miembro."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild><Link href="/ceremonies">Cancelar</Link></Button>
            <Button onClick={generatePDF} disabled={selectedCeremonies.length === 0 || loading}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF ({selectedCeremonies.length})
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Filtrar Ceremonias</CardTitle>
          <CardDescription>
            Busque ceremonias por nombre, tipo u oficiante para exportar.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="search-ceremonies" 
                        placeholder="Buscar por nombre, tipo de ceremonia, oficiante..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card className="max-w-4xl mx-auto mt-6">
        <CardHeader>
            <CardTitle>Resultados de la Búsqueda</CardTitle>
            <CardDescription>
                Seleccione los registros que desea incluir en el reporte. Se encontraron {filteredCeremonies.length} registros.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
            <div className="overflow-x-auto min-h-[300px]">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox 
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                checked={filteredCeremonies.length > 0 && selectedCeremonies.length === filteredCeremonies.length}
                            />
                        </TableHead>
                        <TableHead>Participante</TableHead>
                        <TableHead>Tipo de Ceremonia</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Oficiante</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredCeremonies.map((ceremony) => (
                        <TableRow key={ceremony.id}>
                        <TableCell>
                            <Checkbox 
                                checked={selectedCeremonies.includes(ceremony.id)}
                                onCheckedChange={(checked) => handleSelectOne(ceremony.id, !!checked)}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{ceremony.person}</TableCell>
                        <TableCell>{ceremony.type}</TableCell>
                        <TableCell>{ceremony.date}</TableCell>
                        <TableCell>{ceremony.officiant}</TableCell>
                        </TableRow>
                    ))}
                    {filteredCeremonies.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No se encontraron registros de ceremonias.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            )}
        </CardContent>
      </Card>

    </main>
    </div>
  );
}
