
export interface Suit {
  id: string;
  code: string;
  name: string;
  photoUrl: string;
  purchaseDate: string; // Store as ISO string date YYYY-MM-DD
  suitPrice: number; // Purchase price of the suit
  rentalPrice: number; // Rental price
  
  // Optional fields for current/last rental associated with the suit
  deliveryDate?: string; // Store as ISO string date YYYY-MM-DD
  returnDate?: string; // Store as ISO string date YYYY-MM-DD
  observations?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}
