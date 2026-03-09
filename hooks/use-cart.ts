"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useGuestCartStore, type CartItem } from "@/lib/stores/cart-store";
import {
  addToCart as addToCartAction,
  updateCartItemQuantity as updateCartQuantityAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  getCart,
} from "@/lib/actions/cart";
import { mergeGuestCartOnLogin } from "@/lib/actions/cart";

interface DbCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    nameEn?: string | null;
    price: number;
    mrp?: number | null;
    image: string;
    stock: number;
  };
}

interface UseCartReturn {
  items: CartItem[];
  isLoading: boolean;
  isPending: boolean;
  itemCount: number;
  subtotal: number;
  isAuthenticated: boolean;
  addItem: (
    product: {
      id: string;
      name: string;
      nameEn?: string;
      price: number;
      mrp?: number;
      image: string;
      stock: number;
    },
    quantity?: number
  ) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (
    itemId: string,
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeItem: (itemId: string, productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export function useCart(): UseCartReturn {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  const [isPending, startTransition] = useTransition();
  const [dbCartItems, setDbCartItems] = useState<CartItem[]>([]);
  const [hasMerged, setHasMerged] = useState(false);

  // Guest cart from Zustand
  const guestCart = useGuestCartStore();
  const isHydrated = guestCart.isHydrated;

  // Convert DB cart items to our CartItem format
  const convertDbItems = (items: DbCartItem[]): CartItem[] => {
    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      nameEn: item.product.nameEn || undefined,
      price: item.product.price,
      mrp: item.product.mrp || undefined,
      image: item.product.image,
      quantity: item.quantity,
      stock: item.product.stock,
    }));
  };

  // Fetch cart from database for authenticated users
  const fetchDbCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const cart = await getCart();
      if (cart?.items) {
        setDbCartItems(convertDbItems(cart.items as unknown as DbCartItem[]));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [isAuthenticated]);

  // Merge guest cart when user logs in
  useEffect(() => {
    const mergeCart = async () => {
      if (
        isAuthenticated &&
        isHydrated &&
        !hasMerged &&
        guestCart.items.length > 0
      ) {
        try {
          // Send guest cart items to merge
          const guestItems = guestCart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

          await mergeGuestCartOnLogin(guestItems);

          // Clear guest cart after successful merge
          guestCart.clearCart();
          setHasMerged(true);

          // Refresh cart from database
          await fetchDbCart();
        } catch (error) {
          console.error("Error merging cart:", error);
        }
      }
    };

    mergeCart();
  }, [isAuthenticated, isHydrated, hasMerged, guestCart, fetchDbCart]);

  // Fetch cart on mount for authenticated users
  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      fetchDbCart();
    }
  }, [isAuthenticated, isHydrated, fetchDbCart]);

  // Determine which items to show
  const items = isAuthenticated ? dbCartItems : guestCart.items;
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add item to cart
  const addItem = useCallback(
    async (
      product: {
        id: string;
        name: string;
        nameEn?: string;
        price: number;
        mrp?: number;
        image: string;
        stock: number;
      },
      quantity = 1
    ): Promise<{ success: boolean; error?: string }> => {
      if (isAuthenticated) {
        return new Promise((resolve) => {
          startTransition(async () => {
            const result = await addToCartAction(product.id, quantity);
            if (result.success) {
              await fetchDbCart();
            }
            resolve(result);
          });
        });
      } else {
        // Guest cart - add to local storage
        guestCart.addItem({
          id: product.id,
          productId: product.id,
          name: product.name,
          nameEn: product.nameEn,
          price: product.price,
          mrp: product.mrp,
          image: product.image,
          stock: product.stock,
          quantity,
        });
        return { success: true };
      }
    },
    [isAuthenticated, guestCart, fetchDbCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId: string, productId: string, quantity: number) => {
      if (isAuthenticated) {
        startTransition(async () => {
          await updateCartQuantityAction(itemId, quantity);
          await fetchDbCart();
        });
      } else {
        guestCart.updateQuantity(productId, quantity);
      }
    },
    [isAuthenticated, guestCart, fetchDbCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string, productId: string) => {
      if (isAuthenticated) {
        startTransition(async () => {
          await removeFromCartAction(itemId);
          await fetchDbCart();
        });
      } else {
        guestCart.removeItem(productId);
      }
    },
    [isAuthenticated, guestCart, fetchDbCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      startTransition(async () => {
        await clearCartAction();
        await fetchDbCart();
      });
    } else {
      guestCart.clearCart();
    }
  }, [isAuthenticated, guestCart, fetchDbCart]);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      await fetchDbCart();
    }
  }, [isAuthenticated, fetchDbCart]);

  return {
    items,
    isLoading: isLoading || !isHydrated,
    isPending,
    itemCount,
    subtotal,
    isAuthenticated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };
}
