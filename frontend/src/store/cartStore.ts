import { create } from 'zustand';
import type { CartItem, Product } from '../types/shop';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  loadCart: () => void;
  saveCart: () => void;
}

const CART_STORAGE_KEY = 'calorie-app-cart';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === product.id);

    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...items, { product, quantity }];
    }

    set({ items: newItems });
    get().saveCart();
  },
  removeFromCart: (productId) => {
    const newItems = get().items.filter((item) => item.product.id !== productId);
    set({ items: newItems });
    get().saveCart();
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const newItems = get().items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    set({ items: newItems });
    get().saveCart();
  },
  clearCart: () => {
    set({ items: [] });
    get().saveCart();
  },
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
  loadCart: () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        set({ items });
      }
    } catch (err) {
      console.error('Failed to load cart from storage', err);
    }
  },
  saveCart: () => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(get().items));
    } catch (err) {
      console.error('Failed to save cart to storage', err);
    }
  },
}));

// Load cart on initialization
if (typeof window !== 'undefined') {
  useCartStore.getState().loadCart();
}

