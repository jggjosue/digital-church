'use client';

import * as React from 'react';
import {
  FileText,
  Users,
  BarChart,
  DollarSign,
  HandHeart,
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
import { attendanceRecords, membersData, incomeStatementData, volunteersData } from '@/lib/data';

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
  {
    id: 'volunteers',
    icon: HandHeart,
    title: 'Reportes de Voluntarios',
    description: 'Genere reportes sobre las horas de servicio de los voluntarios, las asignaciones y la información de contacto.',
    buttonText: 'Generar Reporte de Voluntarios',
  }
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

    const generateMembershipReport = () => {
        const doc = new jsPDF() as jsPDF & AutoTable;

        doc.text('Reporte de Membresía', 14, 20);

        const tableColumn = ["Nombre", "Email", "Teléfono", "Estado", "Grupos"];
        const tableRows: (string | number)[][] = [];

        membersData.forEach(member => {
            const memberData = [
                member.name,
                member.email,
                member.phone1,
                member.status,
                member.groups.join(', '),
            ];
            tableRows.push(memberData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save('reporte_membresia.pdf');
    };

    const generateFinancialReport = () => {
        const doc = new jsPDF() as jsPDF & AutoTable;
    
        doc.text('Reporte Financiero - Estado de Ingresos y Gastos', 14, 20);
    
        doc.text('Ingresos', 14, 30);
        const incomeRows = incomeStatementData.income.map(item => [item.label, `$${item.amount.toFixed(2)}`]);
        incomeRows.push(['Ingresos Totales', `$${incomeStatementData.totalIncome.toFixed(2)}`]);
    
        doc.autoTable({
          head: [['Descripción', 'Monto']],
          body: incomeRows,
          startY: 35,
          headStyles: { fillColor: [33, 150, 243] }
        });
    
        const finalY = (doc as any).lastAutoTable.finalY;
    
        doc.text('Gastos', 14, finalY + 10);
        const expenseRows = incomeStatementData.expenses.map(item => [item.label, `$${item.amount.toFixed(2)}`]);
        expenseRows.push(['Gastos Totales', `$${incomeStatementData.totalExpenses.toFixed(2)}`]);
    
        doc.autoTable({
          head: [['Descripción', 'Monto']],
          body: expenseRows,
          startY: finalY + 15,
          headStyles: { fillColor: [244, 67, 54] }
        });

        const finalY2 = (doc as any).lastAutoTable.finalY;

        doc.setFont('helvetica', 'bold');
        doc.text('Ingreso Neto', 14, finalY2 + 10);
        doc.text(`$${incomeStatementData.netIncome.toFixed(2)}`, 150, finalY2 + 10, { align: 'right' });
    
        doc.save('reporte_financiero.pdf');
    };

    const generateVolunteerReport = () => {
        const doc = new jsPDF() as jsPDF & AutoTable;
    
        doc.text('Reporte de Voluntarios', 14, 20);
    
        const tableColumn = ["Nombre", "Email", "Teléfono", "Rol", "Horas Servidas"];
        const tableRows: (string | number)[][] = [];
    
        volunteersData.forEach(volunteer => {
          const volunteerData = [
            volunteer.name,
            volunteer.email,
            volunteer.phone,
            volunteer.role,
            volunteer.hoursServed,
          ];
          tableRows.push(volunteerData);
        });
    
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 30,
        });
    
        doc.save('reporte_voluntarios.pdf');
    }

    const handleReportGeneration = (reportId: string) => {
        if (reportId === 'attendance') {
            generateAttendanceReport();
        } else if (reportId === 'membership') {
            generateMembershipReport();
        } else if (reportId === 'financial') {
            generateFinancialReport();
        } else if (reportId === 'volunteers') {
            generateVolunteerReport();
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
