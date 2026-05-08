import { create } from 'zustand';
import { Product } from '@/lib/data';

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: () => Promise<void>;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const resp = await fetch('/api/products');
            if (!resp.ok) throw new Error('Failed to fetch products');
            const data = await resp.json();
            set({ products: data, isLoading: false });
        } catch (err: unknown) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    addProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            const resp = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!resp.ok) throw new Error('Failed to add product');
            const { product } = await resp.json();
            set((state) => ({ products: [...state.products, product], isLoading: false }));
        } catch (err: unknown) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    updateProduct: async (id, productData) => {
        set({ isLoading: true, error: null });
        try {
            const resp = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!resp.ok) throw new Error('Failed to update product');
            const { product } = await resp.json();
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? product : p)),
                isLoading: false,
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const resp = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!resp.ok) throw new Error('Failed to delete product');
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
                isLoading: false,
            }));
        } catch (err: unknown) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },
}));
