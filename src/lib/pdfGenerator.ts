
'use client';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Suit } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extend jsPDF type to include autoTable - necessary for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generateReceiptPDF(suit: Suit) {
  const doc = new jsPDF();

  // Shop Name / Title
  doc.setFontSize(22);
  doc.text("SuitUp Aluguel", 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text("Comprovante de Aluguel", 105, 30, { align: 'center' });
  doc.setFontSize(10);
  const emissionDate = format(new Date(), "PPP, HH:mm:ss", { locale: ptBR });
  doc.text(`Emitido em: ${emissionDate}`, 105, 36, { align: 'center' });

  doc.autoTable({
    startY: 48,
    head: [['Detalhe do Aluguel', 'Informação']],
    body: [
      ['Terno', `${suit.name} (Cód: ${suit.code})`],
      ['Preço do Aluguel', `R$ ${suit.rentalPrice.toFixed(2)}`],
      ['Cliente', suit.customerName || 'N/A'],
      ['Telefone do Cliente', suit.customerPhone || 'N/A'],
      ['Email do Cliente', suit.customerEmail || 'N/A'],
      ['Data de Entrega', suit.deliveryDate ? format(parseISO(suit.deliveryDate), "PPP", { locale: ptBR }) : 'N/A'],
      ['Data de Devolução', suit.returnDate ? format(parseISO(suit.returnDate), "PPP", { locale: ptBR }) : 'N/A'],
      ['Observações', suit.observations || 'Nenhuma'],
    ],
    theme: 'striped', // 'striped', 'grid', 'plain'
    headStyles: { 
        fillColor: [30, 58, 138], // Tailwind primary color (blue-800 approx)
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
    margin: { top: 15, right: 15, bottom: 20, left: 15 },
    didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`SuitUp Aluguel - Comprovante`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  });

  doc.save(`recibo_aluguel_${suit.code}_${(suit.customerName || 'cliente').replace(/\s+/g, '_')}.pdf`);
}
