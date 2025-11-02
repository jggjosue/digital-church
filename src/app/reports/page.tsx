'use client';

import * as React from 'react';
import {
  FileText,
  Users,
  BarChart,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { attendanceRecords } from '@/lib/data';

type AutoTable = {
    autoTable: (options: any) => void;
};

const reportTypes = [
  {
    id: 'attendance',
    icon: BarChart,
    title: 'Reportes de Asistencia',
    description: 'Genere reportes sobre asistencia a servicios y eventos.',
    buttonText: 'Generar Reporte de Asistencia',
  },
  {
    id: 'membership',
    icon: Users,
    title: 'Reportes de Membresía',
    description: 'Cree reportes sobre demografía, crecimiento y estado de los miembros.',
    buttonText: 'Generar Reporte de Membresía',
  },
  {
    id: 'financial',
    icon: DollarSign,
    title: 'Reportes Financieros',
    description: 'Genere estados de cuenta de donaciones, presupuestos y reportes financieros.',
    buttonText: 'Generar Reporte Financiero',
  },
];

export default function ReportsPage() {
    const generateAttendanceReport = () => {
        const doc = new jsPDF() as jsPDF & AutoTable;
    
        doc.text('Reporte de Asistencia', 14, 20);
    
        const tableColumn = ["Fecha", "Servicio/Evento", "Miembro", "Estado", "Hora de Entrada"];
        const tableRows: (string | number)[][] = [];
    
        attendanceRecords.forEach(record => {
          const recordData = [
            record.date,
            record.serviceName,
            record.memberName,
            record.status,
            record.checkInTime,
          ];
          tableRows.push(recordData);
        });
    
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 30,
        });
    
        doc.save('reporte_asistencia.pdf');
      };

    const handleReportGeneration = (reportId: string) => {
        if (reportId === 'attendance') {
            generateAttendanceReport();
        } else {
            alert(`La generación del reporte para "${reportId}" aún no está implementada.`);
        }
    }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Centro de Reportes
          </h1>
          <p className="text-muted-foreground">
            Seleccione y genere reportes personalizados para su iglesia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <CardDescription>{report.description}</CardDescription>
              <Button className="mt-6 w-full" onClick={() => handleReportGeneration(report.id)}>{report.buttonText}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
