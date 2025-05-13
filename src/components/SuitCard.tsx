import Image from 'next/image';
import type { Suit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, CalendarDays, Edit, Trash2, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SuitCardProps = {
  suit: Suit;
  onEdit: (suit: Suit) => void;
  onDelete: (suitId: string) => void;
};

export function SuitCard({ suit, onEdit, onDelete }: SuitCardProps) {
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
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageOff className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{suit.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2">Code: {suit.code}</CardDescription>
        
        <div className="flex items-center text-lg font-semibold text-primary mb-2">
          <DollarSign className="mr-2 h-5 w-5" /> {suit.rentalPrice.toFixed(2)} / rental
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Suit Price: ${suit.suitPrice.toFixed(2)}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarDays className="mr-1 h-3 w-3" /> Purchased: {new Date(suit.purchaseDate).toLocaleDateString()}
        </div>

        {suit.customerName && (
          <Badge variant="secondary" className="mt-2">Rented by: {suit.customerName}</Badge>
        )}
        {suit.returnDate && (
           <p className="text-xs text-muted-foreground mt-1">Return: {new Date(suit.returnDate).toLocaleDateString()}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onEdit(suit)} className="mr-2">
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(suit.id)}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
