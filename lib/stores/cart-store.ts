import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // productId for guest cart
  productId: string;
  name: string;
  nameEn?: string;
  price: number;
  mrp?: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  setItems: (items: CartItem[]) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useGuestCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId
        );

        if (existingIndex >= 0) {
          // Update quantity if item exists
          const newItems = [...items];
          const newQuantity =
            newItems[existingIndex].quantity + (item.quantity || 1);
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: Math.min(newQuantity, item.stock), // Don't exceed stock
          };
          set({ items: newItems });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...item,
                id: item.productId,
                quantity: item.quantity || 1,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.productId !== productId) });
        } else {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      setItems: (items) => {
        set({ items });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: "guest-cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Helper to check if running on client
export const isClient = typeof window !== "undefined";
