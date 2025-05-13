import type { Suit } from '@/types';

export function exportSuitsToCSV(suits: Suit[]) {
  const headers = [
    'Código',
    'Nome',
    'Foto URL', 
    'Data da Compra',
    'Valor do Terno',
    'Valor do Aluguel',
    'Data da Devolução',
  ];

  const csvRows = [headers.join(',')];

  suits.forEach(suit => {
    const row = [
      suit.code,
      suit.name,
      suit.photoUrl, 
      suit.purchaseDate,
      suit.suitPrice,
      suit.rentalPrice,
      suit.returnDate || '', 
    ].map(value => {
      const stringValue = String(value ?? ''); 
      return `"${stringValue.replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const filename = 'catalogo_ternos.csv';
  
  if (navigator.msSaveBlob) { 
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
