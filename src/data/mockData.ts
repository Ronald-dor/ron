
import type { Suit } from '@/types';

export const mockSuits: Suit[] = [
  {
    id: '1',
    code: 'S001',
    name: 'Classic Black Tuxedo',
    photoUrl: 'https://picsum.photos/seed/tuxedo/400/500',
    purchaseDate: '2023-01-15',
    suitPrice: 500,
    rentalPrice: 80,
    deliveryDate: '2024-07-20',
    returnDate: '2024-07-22', // Future date
    observations: 'Excellent condition, includes bow tie.',
    customerName: 'John Doe',
    customerPhone: '555-1234',
    customerEmail: 'john.doe@example.com',
    isReturned: false,
  },
  {
    id: '2',
    code: 'S002',
    name: 'Modern Navy Blue Suit',
    photoUrl: 'https://picsum.photos/seed/navysuit/400/500',
    purchaseDate: '2023-03-10',
    suitPrice: 450,
    rentalPrice: 75,
    observations: 'Slim fit, modern cut.',
    isReturned: false, // Or undefined, will default to false
  },
  {
    id: '3',
    code: 'S003',
    name: 'Charcoal Grey Business Suit',
    photoUrl: 'https://picsum.photos/seed/greysuit/400/500',
    purchaseDate: '2022-11-05',
    suitPrice: 400,
    rentalPrice: 70,
    customerName: 'Jane Smith',
    customerPhone: '555-5678',
    customerEmail: 'jane.smith@example.com',
    deliveryDate: '2024-07-01',
    returnDate: '2024-07-10', // Past date
    isReturned: true,
  },
  {
    id: '4',
    code: 'S004',
    name: 'Elegant Beige Linen Suit',
    photoUrl: 'https://picsum.photos/seed/beigesuit/400/500',
    purchaseDate: '2023-05-20',
    suitPrice: 350,
    rentalPrice: 65,
    observations: 'Perfect for summer events. Lightweight.',
  },
  {
    id: '5',
    code: 'S005',
    name: 'Dark Grey Modern Fit',
    photoUrl: 'https://picsum.photos/seed/darkgreysuit/400/500',
    purchaseDate: '2023-08-12',
    suitPrice: 480,
    rentalPrice: 85,
    customerName: 'Robert Brown',
    customerPhone: '555-0011',
    customerEmail: 'robert.brown@example.com',
    deliveryDate: '2024-07-28', // Upcoming return for notification test
    returnDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
    observations: 'Needs dry cleaning after return.',
    isReturned: false,
  }
];

