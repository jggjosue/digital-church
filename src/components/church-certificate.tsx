'use client';

import * as React from 'react';
import { Award, Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChurchLocation } from '@/lib/church-locations';

function certificateAddress(church: ChurchLocation) {
  return [
    church.streetAddress || church.address,
    church.neighborhood,
    church.city || church.municipality,
    church.state,
    church.zip,
    church.country,
  ]
    .map((value) => String(value ?? '').trim())
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ');
}

function formatPastoralStartDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Fecha no registrada';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(year, month - 1, day));
}

export function getChurchRegistrationNumber(church: ChurchLocation) {
  return church.registrationNumber?.trim() || `ICIAR-${church.id.replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase()}`;
}

export function getChurchPastoralAssignment(church: ChurchLocation) {
  return church.pastoralAssignment?.trim() || `Pastor titular de ${church.name}`;
}

export function ChurchCertificate({ church }: { church: ChurchLocation }) {
  const [downloading, setDownloading] = React.useState(false);
  const registration = getChurchRegistrationNumber(church);
  const assignment = getChurchPastoralAssignment(church);
  const address = certificateAddress(church) || 'Domicilio no registrado';
  const pastoralStartDate = formatPastoralStartDate(church.pastoralStartDate);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const center = pageWidth / 2;

      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(1.2);
      doc.rect(9, 9, pageWidth - 18, pageHeight - 18);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.35);
      doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('IGLESIA CRISTIANA INTERDENOMINACIONAL', center, 27, { align: 'center' });
      doc.setFontSize(9);
      doc.text('ASAMBLEAS DE RESTAURACIÓN · NAYARIT', center, 34, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(24);
      doc.text('CERTIFICADO DE IGLESIA', center, 52, { align: 'center' });
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.6);
      doc.line(center - 48, 57, center + 48, 57);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Por medio del presente se hace constar que la congregación', center, 70, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(church.name, center, 82, { align: 'center', maxWidth: pageWidth - 50 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const details = [
        ['MATRÍCULA', registration],
        ['PASTOR RESPONSABLE', church.campusPastor?.trim() || 'Por asignar'],
        ['PASTOR DESDE', pastoralStartDate],
        ['ASIGNACIÓN', assignment],
        ['DOMICILIO', address],
      ] as const;
      let y = 99;
      for (const [label, value] of details) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(`${label}:`, 36, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(value, pageWidth - 100) as string[];
        doc.text(lines, 76, y);
        y += Math.max(11, lines.length * 5.5 + 4);
      }

      doc.setDrawColor(100, 116, 139);
      doc.line(center - 38, pageHeight - 35, center + 38, pageHeight - 35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('AUTORIDAD ECLESIÁSTICA', center, pageHeight - 29, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.text(`Expedido el ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date())}`, center, pageHeight - 20, { align: 'center' });

      const filename = `certificado-iglesia-${registration.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      doc.save(filename);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-blue-200 bg-gradient-to-br from-white to-blue-50/60">
      <CardHeader className="border-b border-blue-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="h-5 w-5 text-blue-700" />
              Certificado de la iglesia
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Constancia institucional del templo y su asignación pastoral.</p>
          </div>
          <Button type="button" onClick={() => void downloadPdf()} disabled={downloading} className="bg-blue-700 hover:bg-blue-800">
            {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {downloading ? 'Generando…' : 'Descargar PDF'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-5">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matrícula</p><p className="mt-1 font-semibold">{registration}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pastor responsable</p><p className="mt-1 font-semibold">{church.campusPastor?.trim() || 'Por asignar'}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pastor desde</p><p className="mt-1 font-semibold">{pastoralStartDate}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asignación</p><p className="mt-1 font-semibold">{assignment}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domicilio</p><p className="mt-1 font-semibold">{address}</p></div>
      </CardContent>
    </Card>
  );
}
