import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Customer, Lead, Task, Employee, CompanySettings } from '../types';

// Helper to sanitize filename
export const sanitizeFileName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9_]/gi, '_');
};

// ==================== CSV / EXCEL EXPORTS (XLSX Engine) ====================

export const exportToExcel = (
  filename: string,
  sheets: { sheetName: string; data: Record<string, any>[] }[]
) => {
  try {
    const wb = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, data }) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Excel 31 char sheet limit
      } else {
        const ws = XLSX.utils.json_to_sheet([{ "No Data": "No records found" }]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      }
    });

    XLSX.writeFile(wb, `${sanitizeFileName(filename)}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (err) {
    console.error('Error generating Excel file:', err);
    // Fallback to pure CSV download if XLSX writing encounters an issue
    fallbackCsvExport(filename, sheets[0]?.data || []);
  }
};

export const fallbackCsvExport = (filename: string, data: Record<string, any>[]) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const cell = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return `"${cell.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(filename)}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==================== ENTERPRISE PDF EXPORT ENGINE ====================

interface PdfReportOptions {
  title: string;
  subtitle?: string;
  timeframe?: string;
  settings?: CompanySettings;
  metrics?: { label: string; value: string }[];
  tables: {
    heading: string;
    columns: string[];
    rows: (string | number)[][];
  }[];
}

export const generatePdfReport = ({
  title,
  subtitle,
  timeframe = 'Current Session',
  settings,
  metrics,
  tables
}: PdfReportOptions) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const companyName = (settings?.companyName || 'TRISHUL CRM & ENTERPRISE').trim();
    const tagline = (settings?.tagline || settings?.companyTagline || 'Innovate • Empower • Excel').trim();
    const email = (settings?.email || settings?.adminEmail || 'support@trishulcrm.com').trim();
    const phone = (settings?.phone || settings?.adminPhone || '+91 94551 09687').trim();
    
    // Format GSTIN appropriately
    const rawGstin = (settings?.taxNumber || settings?.gstin || '').trim();
    let gstin = '';
    if (rawGstin) {
      gstin = rawGstin.toUpperCase().startsWith('GSTIN') ? rawGstin : `GSTIN: ${rawGstin}`;
    }

    const darkHeaderBg: [number, number, number] = [15, 23, 42]; // slate-900

    // Header Background Bar
    doc.setFillColor(...darkHeaderBg);
    doc.rect(0, 0, 210, 32, 'F');

    // Brand / Logo Top Left
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName.toUpperCase(), 14, 15);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.text(tagline, 14, 22);

    // Meta details Top Right
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${email} | ${phone}`, 196, 14, { align: 'right' });
    if (gstin) {
      doc.text(gstin, 196, 20, { align: 'right' });
    }
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 196, 26, { align: 'right' });

    let currentY = 42;

    // Document Title Banner
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, currentY);

    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${subtitle} | Timeframe: ${timeframe}`, 14, currentY + 5);
      currentY += 12;
    } else {
      currentY += 8;
    }

    // High Level Metric KPI Boxes if provided
    if (metrics && metrics.length > 0) {
      const boxWidth = (182 - (metrics.length - 1) * 4) / metrics.length;
      const boxHeight = 16;

      metrics.forEach((m, idx) => {
        const boxX = 14 + idx * (boxWidth + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'FD');

        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text(m.label.toUpperCase(), boxX + 4, currentY + 5);

        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(String(m.value), boxX + 4, currentY + 12);
      });

      currentY += boxHeight + 8;
    }

    // Render Tables using AutoTable
    tables.forEach((tbl) => {
      // Check page break for table heading
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(tbl.heading, 14, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [tbl.columns],
        body: tbl.rows,
        margin: { left: 14, right: 14 },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 2.5,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        didDrawPage: () => {
          // Footer on each page
          const str = `Page ${doc.getNumberOfPages()} • Confidential & Proprietary`;
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(str, 14, 290);
          doc.text(`Powered by ${companyName}`, 196, 290, { align: 'right' });
        }
      });

      // @ts-ignore - lastAutoTable is injected by jspdf-autotable
      if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 10;
      } else {
        currentY += 40;
      }
    });

    // Trigger instant download in browser / iframe safe
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `${sanitizeFileName(title)}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    // Fallback: Trigger browser print
    window.print();
  }
};

