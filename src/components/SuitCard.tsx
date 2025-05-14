
import Image from 'next/image';
import type { Suit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Edit, Trash2, ImageOff, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateReceiptPDF } from '@/lib/pdfGenerator'; 

type SuitCardProps = {
  suit: Suit;
  onEdit: (suit: Suit) => void;
  onDelete: (suitId: string) => void;
  isForAvailableCatalog?: boolean; // New prop
};

export function SuitCard({ suit, onEdit, onDelete, isForAvailableCatalog = false }: SuitCardProps) {
  const hasRentalHistory = !!suit.customerName;

  const handleGenerateReceipt = () => {
    if (hasRentalHistory) { 
      generateReceiptPDF(suit);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <div className="aspect-[3/4] w-full relative bg-muted">
          {suit.photoUrl ? (
            <Image
              src={suit.photoUrl} 
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

        {hasRentalHistory && !isForAvailableCatalog && suit.isReturned && (
          <Badge variant="outline" className="mt-2 mb-1 text-xs bg-green-100 text-green-700 border-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Devolvido
          </Badge>
        )}
        {hasRentalHistory && !isForAvailableCatalog && !suit.isReturned && (
          <Badge variant="outline" className="mt-2 mb-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
             <Clock className="mr-1 h-3 w-3" /> Pendente
          </Badge>
        )}

        {suit.customerName && !isForAvailableCatalog && (
          <p className="text-sm mt-2"><strong>Cliente:</strong> {suit.customerName}</p>
        )}
        {suit.returnDate && !isForAvailableCatalog && !suit.isReturned && ( 
           <p className="text-xs text-muted-foreground mt-1">Devolução em: {new Date(suit.returnDate).toLocaleDateString('pt-BR')}</p>
        )}
         {suit.returnDate && !isForAvailableCatalog && suit.isReturned && ( 
           <p className="text-xs text-muted-foreground mt-1">Devolvido em: {new Date(suit.returnDate).toLocaleDateString('pt-BR')}</p>
        )}

      </CardContent>
      <CardFooter className="p-4 border-t flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(suit)} className="flex-grow sm:flex-grow-0">
          <Edit className="mr-1 h-4 w-4" /> Editar
        </Button>
        {hasRentalHistory && !isForAvailableCatalog && (
          <Button variant="outline" size="sm" onClick={handleGenerateReceipt} className="flex-grow sm:flex-grow-0 w-full sm:w-auto">
            <FileText className="mr-1 h-4 w-4" /> Gerar Recibo
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => onDelete(suit.id)} className="flex-grow sm:flex-grow-0">
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}

