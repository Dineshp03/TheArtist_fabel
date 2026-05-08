import { create } from 'zustand';
import { Product } from '@/lib/data';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  addItem: (product) => set((state) => {
    const existing = state.items.find((i) => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        isCartOpen: true,
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }], isCartOpen: true };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((i) => i.id === id ? { ...i, quantity } : i),
  })),
  clearCart: () => set({ items: [] }),
  toggleCart: (open) => set((state) => ({
    isCartOpen: open !== undefined ? open : !state.isCartOpen
  })),
  totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}));
