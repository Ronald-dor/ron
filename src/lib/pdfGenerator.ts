
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

  // Company Info Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let companyAddress = `${companyInfo.addressStreet}, ${companyInfo.addressNumber}`;
  if (companyInfo.addressComplement) {
    companyAddress += ` - ${companyInfo.addressComplement}`;
  }
  companyAddress += `\n${companyInfo.addressNeighborhood} - ${companyInfo.addressCity}/${companyInfo.addressState} - CEP: ${companyInfo.addressZip}`;
  doc.text(companyAddress, 105, 28, { align: 'center' });

  let companyContact = `Tel: ${companyInfo.phone} | Email: ${companyInfo.email}`;
  if (companyInfo.cnpj) {
    companyContact += `\nCNPJ: ${companyInfo.cnpj}`;
  }
  doc.text(companyContact, 105, doc.getTextDimensions(companyAddress).h + 30, { align: 'center' });

  const lineYPosition = doc.getTextDimensions(companyAddress).h + doc.getTextDimensions(companyContact).h + 32;
  doc.setLineWidth(0.5);
  doc.line(15, lineYPosition, 195, lineYPosition);


  // Receipt Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Comprovante de Aluguel", 105, lineYPosition + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const emissionDate = format(new Date(), "'Emitido em:' PPP, HH:mm:ss", { locale: ptBR });
  doc.text(emissionDate, 105, lineYPosition + 16, { align: 'center' });


  doc.autoTable({
    startY: lineYPosition + 24,
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
    margin: { top: 15, right: 15, bottom: 25, left: 15 }, // Increased bottom margin for footer
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

