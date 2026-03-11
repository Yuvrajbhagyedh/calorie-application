import type { Product } from '../types/shop';

// Offline product catalog used when the backend/database isn't available.
// Keep IDs stable so carts saved in localStorage still match products.
export const offlineProducts: Product[] = [
  {
    id: 1001,
    name: 'Whey Protein (Vanilla) - 1kg',
    description: 'High-protein whey blend. Great for post-workout recovery.',
    price: 2199,
    image:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80',
    category: 'Supplements',
    inStock: true,
  },
  {
    id: 1002,
    name: 'Plant Protein (Chocolate) - 900g',
    description: 'Dairy-free protein with a smooth cocoa taste.',
    price: 1999,
    image:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80',
    category: 'Supplements',
    inStock: true,
  },
  {
    id: 1003,
    name: 'Shaker Bottle (700ml)',
    description: 'Leak-proof shaker with mixing ball.',
    price: 299,
    image:
      'https://images.unsplash.com/photo-1615485925873-2d7bd2c6f2a3?auto=format&fit=crop&w=1200&q=80',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 1004,
    name: 'Yoga Mat (Non-slip)',
    description: 'Comfortable grip for yoga, stretching and core workouts.',
    price: 899,
    image:
      'https://images.unsplash.com/photo-1599447292180-45a5d2b55137?auto=format&fit=crop&w=1200&q=80',
    category: 'Fitness',
    inStock: true,
  },
  {
    id: 1005,
    name: 'Resistance Bands Set',
    description: '5-band set for strength training anywhere.',
    price: 499,
    image:
      'https://images.unsplash.com/photo-1596357395217-80de13130e92?auto=format&fit=crop&w=1200&q=80',
    category: 'Fitness',
    inStock: true,
  },
  {
    id: 1006,
    name: 'Smart Water Bottle (1L)',
    description: 'Stay hydrated with a lightweight carry loop.',
    price: 649,
    image:
      'https://images.unsplash.com/photo-1526401485004-2aa7f3b1f14c?auto=format&fit=crop&w=1200&q=80',
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 1007,
    name: 'Creatine Monohydrate - 250g',
    description: 'Supports strength and performance. Unflavoured.',
    price: 799,
    image:
      'https://images.unsplash.com/photo-1600180758890-6b94519a8ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Supplements',
    inStock: true,
  },
  {
    id: 1008,
    name: 'Healthy Snack Box',
    description: 'Mixed nuts and dried fruit for clean snacking.',
    price: 549,
    image:
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80',
    category: 'Nutrition',
    inStock: true,
  },
];

export const offlineProductIds = new Set(offlineProducts.map((p) => p.id));