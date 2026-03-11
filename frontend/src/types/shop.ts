export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string | null;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMode = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

export interface PaymentDetails {
  mode: PaymentMode;
  upiId?: string;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  bankName?: string;
  walletType?: string;
}

export interface Order {
  id: string | number;
  items: CartItem[];
  total: number;
  paymentMode: PaymentMode;
  status: 'success' | 'failed' | 'pending';
  message?: string;
  timestamp: string;
  createdAt?: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  itemCount?: number;
}

