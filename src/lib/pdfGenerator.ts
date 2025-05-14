
'use client';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Suit, CompanyInfo } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generateReceiptPDF(suit: Suit, companyInfo: CompanyInfo) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  let currentY = 20; // Initial Y position
  const smallLineSpacing = 1.8; // Spacing between detail lines
  const sectionSpacing = 4; // Spacing after a block or before a line

  // Company Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(companyInfo.name).h + sectionSpacing / 2;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Address Details
  let addressLine1 = `${companyInfo.addressStreet}, ${companyInfo.addressNumber}`;
  if (companyInfo.addressComplement && companyInfo.addressComplement.trim() !== '') {
    addressLine1 += ` - ${companyInfo.addressComplement}`;
  }
  doc.text(addressLine1, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(addressLine1).h + smallLineSpacing;

  doc.text(companyInfo.addressNeighborhood, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(companyInfo.addressNeighborhood).h + smallLineSpacing;

  doc.text(`${companyInfo.addressCity} / ${companyInfo.addressState}`, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(`${companyInfo.addressCity} / ${companyInfo.addressState}`).h + smallLineSpacing;
  
  doc.text(`CEP: ${companyInfo.addressZip}`, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(`CEP: ${companyInfo.addressZip}`).h + sectionSpacing / 2;

  // Contact Details
  doc.text(`Telefone: ${companyInfo.phone}`, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(`Telefone: ${companyInfo.phone}`).h + smallLineSpacing;

  doc.text(`Email: ${companyInfo.email}`, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(`Email: ${companyInfo.email}`).h + smallLineSpacing;

  if (companyInfo.cnpj && companyInfo.cnpj.trim() !== '') {
    doc.text(`CNPJ: ${companyInfo.cnpj}`, centerX, currentY, { align: 'center' });
    currentY += doc.getTextDimensions(`CNPJ: ${companyInfo.cnpj}`).h + smallLineSpacing;
  }
  
  currentY += sectionSpacing / 2; // Space before the horizontal line

  // Horizontal Line
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += sectionSpacing + 2; // Space after line, before title

  // Receipt Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Comprovante de Aluguel", centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions("Comprovante de Aluguel").h + 2;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const emissionDate = format(new Date(), "'Emitido em:' PPP, HH:mm:ss", { locale: ptBR });
  doc.text(emissionDate, centerX, currentY, { align: 'center' });
  currentY += doc.getTextDimensions(emissionDate).h + sectionSpacing;


  doc.autoTable({
    startY: currentY,
    head: [['Detalhe do Aluguel', 'Informação']],
    body: [
      ['Terno', `${suit.name} (Cód: ${suit.code})`],
      ['Preço do Aluguel', `R$ ${suit.rentalPrice.toFixed(2).replace('.', ',')}`],
      ['Cliente', suit.customerName || 'N/A'],
      ['Telefone do Cliente', suit.customerPhone || 'N/A'],
      ['Email do Cliente', suit.customerEmail || 'N/A'],
      ['Data de Entrega', suit.deliveryDate ? format(parseISO(suit.deliveryDate), "PPP", { locale: ptBR }) : 'N/A'],
      ['Data de Devolução', suit.returnDate ? format(parseISO(suit.returnDate), "PPP", { locale: ptBR }) : 'N/A'],
      ['Observações', suit.observations || 'Nenhuma'],
    ],
    theme: 'striped', 
    headStyles: { 
        fillColor: [30, 58, 138], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
    },
    styles: { 
        fontSize: 10, 
        cellPadding: 3,
        valign: 'middle',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' },
    },
    margin: { top: 15, right: 15, bottom: 25, left: 15 },
    didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`${companyInfo.name} - Comprovante de Aluguel`, data.settings.margin.left, doc.internal.pageSize.height - 15);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 15, { align: 'right' });
    }
  });

  doc.save(`recibo_aluguel_${suit.code}_${(suit.customerName || 'cliente').replace(/\s+/g, '_')}.pdf`);
}

