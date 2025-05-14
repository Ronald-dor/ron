
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
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  const centerX = pageWidth / 2;
  let currentY = margin; 
  const smallLineSpacing = 1.8; 
  const sectionSpacing = 4; 

  // Add Company Logo if available
  if (companyInfo.logoUrl) {
    try {
      const imgProps = doc.getImageProperties(companyInfo.logoUrl);
      const desiredLogoHeight = companyInfo.receiptLogoHeight || 20; // Use configured height or default
      let logoDisplayWidth = (imgProps.width * desiredLogoHeight) / imgProps.height;
      const maxLogoWidth = contentWidth * 0.8; // Max 80% of content width
      if (logoDisplayWidth > maxLogoWidth) {
        logoDisplayWidth = maxLogoWidth;
      }
      const logoX = centerX - (logoDisplayWidth / 2);
      
      doc.addImage(companyInfo.logoUrl, 'AUTO', logoX, currentY, logoDisplayWidth, desiredLogoHeight);
      currentY += desiredLogoHeight + 5; 
    } catch (e) {
      console.error("Erro ao adicionar logo ao PDF:", e);
      // If logo fails, add some default spacing
      currentY += (companyInfo.receiptLogoHeight || 20) / 2;
    }
  } else {
    currentY = 20; 
  }


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

  if (companyInfo.cnpj && companyInfo.cnpj.trim() !== '' && companyInfo.receiptShowCnpj !== false) {
    doc.text(`CNPJ: ${companyInfo.cnpj}`, centerX, currentY, { align: 'center' });
    currentY += doc.getTextDimensions(`CNPJ: ${companyInfo.cnpj}`).h + smallLineSpacing;
  }
  
  currentY += sectionSpacing / 2; 

  // Horizontal Line
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += sectionSpacing + 2; 

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

  // Table Data
  const tableBody = [
    ['Terno', `${suit.name} (Cód: ${suit.code})`],
    ['Preço do Aluguel', `R$ ${suit.rentalPrice.toFixed(2).replace('.', ',')}`],
    ['Cliente', suit.customerName || 'N/A'],
  ];

  if (companyInfo.receiptShowCustomerPhone !== false && suit.customerPhone) {
    tableBody.push(['Telefone do Cliente', suit.customerPhone]);
  }
  if (companyInfo.receiptShowCustomerEmail !== false && suit.customerEmail) {
    tableBody.push(['Email do Cliente', suit.customerEmail]);
  }
  
  tableBody.push(['Data de Entrega', suit.deliveryDate ? format(parseISO(suit.deliveryDate), "PPP", { locale: ptBR }) : 'N/A']);
  tableBody.push(['Data de Devolução', suit.returnDate ? format(parseISO(suit.returnDate), "PPP", { locale: ptBR }) : 'N/A']);
  
  if (companyInfo.receiptShowRentalObservations !== false && suit.observations) {
    tableBody.push(['Observações do Aluguel', suit.observations]);
  } else if (companyInfo.receiptShowRentalObservations !== false && !suit.observations) {
    tableBody.push(['Observações do Aluguel', 'Nenhuma']);
  }


  doc.autoTable({
    startY: currentY,
    head: [['Detalhe do Aluguel', 'Informação']],
    body: tableBody,
    theme: companyInfo.receiptTableTheme || 'striped', 
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
    margin: { top: margin, right: margin, bottom: 25, left: margin }, 
    didDrawPage: (data) => {
      let finalY = data.cursor?.y || currentY; // Use cursor.y from autoTable hook

      // Custom Text Section
      if (companyInfo.receiptCustomText && companyInfo.receiptCustomText.trim() !== '') {
        finalY += sectionSpacing; 
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const customTitle = companyInfo.receiptCustomTextTitle?.trim() || 'Observações Adicionais';
        doc.text(customTitle, margin, finalY);
        finalY += doc.getTextDimensions(customTitle).h + 2;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        // Ensure contentWidth is correctly defined here if not globally
        const customTextLines = doc.splitTextToSize(companyInfo.receiptCustomText, contentWidth);
        doc.text(customTextLines, margin, finalY);
        // finalY += (doc.getTextDimensions(customTextLines).h * customTextLines.length) + sectionSpacing; // This was incorrect as getTextDimensions gives height of single line
        finalY += (doc.getTextDimensions('M').h * customTextLines.length) + sectionSpacing; // Approximate height based on 'M' char
      }


      // Footer (Page Number and Company Name for Footer)
      const pageHeight = doc.internal.pageSize.getHeight(); // Ensure pageHeight is accessible
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const footerTextY = pageHeight - 15; 
      doc.text(`${companyInfo.name} - Comprovante de Aluguel`, margin, footerTextY);
      
      const pageCount = doc.getNumberOfPages(); // For total pages
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, footerTextY, { align: 'right' });
    }
  });
  
  doc.save(`recibo_aluguel_${suit.code}_${(suit.customerName || 'cliente').replace(/\s+/g, '_')}.pdf`);
}

