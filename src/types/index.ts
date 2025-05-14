
export interface Suit {
  id: string;
  code: string;
  name: string;
  photoUrl: string;
  purchaseDate: string; // Store as ISO string date YYYY-MM-DD
  suitPrice: number; // Purchase price of the suit
  rentalPrice: number; // Rental price
  isReturned?: boolean; // Status of the rental
  
  // Optional fields for current/last rental associated with the suit
  deliveryDate?: string; // Store as ISO string date YYYY-MM-DD
  returnDate?: string; // Store as ISO string date YYYY-MM-DD
  observations?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export type ReceiptTableTheme = 'striped' | 'grid' | 'plain';

export interface CompanyInfo {
  name: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  phone: string;
  email: string;
  cnpj?: string;
  logoUrl?: string; // Added for company logo
  receiptCustomTextTitle?: string; // Title for custom text section on receipt
  receiptCustomText?: string; // Custom text for receipt (e.g., terms, notes)

  // PDF Customization Options
  receiptShowCompanyName?: boolean; // Added
  receiptShowCnpj?: boolean;
  receiptShowCustomerEmail?: boolean;
  receiptShowCustomerPhone?: boolean;
  receiptShowRentalObservations?: boolean;
  receiptLogoHeight?: number; // e.g., 15, 20, 25 (mm)
  receiptTableTheme?: ReceiptTableTheme;
}

