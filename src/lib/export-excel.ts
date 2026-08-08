'use client';

export type ExcelCellValue = string | number | boolean | Date | null | undefined;

export type ExcelReportSection = {
  name: string;
  columns: string[];
  rows: ExcelCellValue[][];
  currencyColumns?: number[];
  percentageColumns?: number[];
  dateColumns?: number[];
};

type ExportExcelReportOptions = {
  fileName: string;
  title: string;
  metadata?: Array<[string, ExcelCellValue]>;
  sections: ExcelReportSection[];
};

const safeSheetName = (name: string) =>
  name.replace(/[\\/?*\[\]:]/g, ' ').trim().slice(0, 31) || 'Reporte';

export async function exportExcelReport({
  fileName,
  title,
  metadata = [],
  sections,
}: ExportExcelReportOptions) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  const summaryRows: ExcelCellValue[][] = [
    [title],
    ['Generado', new Date()],
    ...metadata,
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 28 }, { wch: 34 }];
  if (summarySheet.B2) summarySheet.B2.z = 'yyyy-mm-dd hh:mm';
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Información');

  sections.forEach((section, sectionIndex) => {
    const rows = section.rows.length > 0
      ? [section.columns, ...section.rows]
      : [section.columns, section.columns.map((_, index) => index === 0 ? 'Sin registros' : '')];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const lastColumn = Math.max(0, section.columns.length - 1);
    sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ r: 0, c: 0 }, { r: rows.length - 1, c: lastColumn }) };
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    sheet['!cols'] = section.columns.map((column, columnIndex) => {
      const longestValue = rows.reduce(
        (max, row) => Math.max(max, String(row[columnIndex] ?? '').length),
        column.length
      );
      return { wch: Math.min(48, Math.max(12, longestValue + 2)) };
    });

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      for (const columnIndex of section.currencyColumns ?? []) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell && typeof cell.v === 'number') cell.z = '$#,##0.00;[Red]($#,##0.00);-';
      }
      for (const columnIndex of section.percentageColumns ?? []) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell && typeof cell.v === 'number') cell.z = '0.0%';
      }
      for (const columnIndex of section.dateColumns ?? []) {
        const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
        if (cell) cell.z = 'yyyy-mm-dd';
      }
    }

    const uniqueName = safeSheetName(
      sectionIndex === 0 ? section.name : `${section.name} ${sectionIndex + 1}`
    );
    XLSX.utils.book_append_sheet(workbook, sheet, uniqueName);
  });

  XLSX.writeFile(workbook, `${fileName.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-')}.xlsx`, {
    compression: true,
    cellDates: true,
  });
}
