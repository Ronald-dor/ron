import type { Suit } from '@/types';

export function exportSuitsToCSV(suits: Suit[]) {
  // Fields for export as per user request:
  // "foto do terno, nome, valor do terno, valor do aluguel, data da compra, data da devolução, código"
  const headers = [
    'Code',        // código
    'Name',        // nome
    'Photo URL',   // foto do terno
    'Purchase Date',// data da compra
    'Suit Price',  // valor do terno
    'Rental Price',// valor do aluguel
    'Return Date', // data da devolução
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
      suit.returnDate || '', // Handle optional field
    ].map(value => {
      const stringValue = String(value ?? ''); // Ensure value is a string, handle null/undefined
      return `"${stringValue.replace(/"/g, '""')}"`; // Escape double quotes
    });
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // For IE 10+
    navigator.msSaveBlob(blob, 'suit_catalog.csv');
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'suit_catalog.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
