
import Image from 'next/image';
import type { Suit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Edit, Trash2, ImageOff, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateReceiptPDF } from '@/lib/pdfGenerator'; // Import the PDF generator

type SuitCardProps = {
  suit: Suit;
  onEdit: (suit: Suit) => void;
  onDelete: (suitId: string) => void;
};

export function SuitCard({ suit, onEdit, onDelete }: SuitCardProps) {
  const isRented = !!suit.customerName && !!suit.deliveryDate && !!suit.returnDate;

  const handleGenerateReceipt = () => {
    if (isRented) {
      generateReceiptPDF(suit);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <div className="aspect-[3/4] w-full relative bg-muted">
          {suit.photoUrl ? (
            <Image
              src={suit.photoUrl} // Handles both Data URIs and web URLs
              alt={suit.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint="suit fashion photo"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'; 
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageOff className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
           {!suit.photoUrl && (
             <div className="absolute inset-0 flex items-center justify-center h-full">
              <ImageOff className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{suit.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2">Código: {suit.code}</CardDescription>
        
        <div className="text-lg font-semibold text-primary mb-2">
           R$ {suit.rentalPrice.toFixed(2).replace('.', ',')} / aluguel
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Preço do Terno: R$ {suit.suitPrice.toFixed(2).replace('.', ',')}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarDays className="mr-1 h-3 w-3" /> Comprado em: {new Date(suit.purchaseDate).toLocaleDateString('pt-BR')}
        </div>

        {suit.customerName && (
          <Badge variant="secondary" className="mt-2">Alugado por: {suit.customerName}</Badge>
        )}
        {suit.returnDate && (
           <p className="text-xs text-muted-foreground mt-1">Devolução: {new Date(suit.returnDate).toLocaleDateString('pt-BR')}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(suit)} className="flex-grow sm:flex-grow-0">
          <Edit className="mr-1 h-4 w-4" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(suit.id)} className="flex-grow sm:flex-grow-0">
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
        {isRented && (
          <Button variant="outline" size="sm" onClick={handleGenerateReceipt} className="flex-grow sm:flex-grow-0 w-full sm:w-auto">
            <FileText className="mr-1 h-4 w-4" /> Gerar Recibo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
