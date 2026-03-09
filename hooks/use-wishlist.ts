"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} from "@/lib/actions/wishlist";

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

interface UseWishlistReturn {
  items: WishlistItem[];
  isLoading: boolean;
  isPending: boolean;
  itemCount: number;
  isAuthenticated: boolean;
  isInWishlist: (productId: string) => boolean;
  toggle: (
    productId: string
  ) => Promise<{ success: boolean; action?: string; error?: string }>;
  add: (productId: string) => Promise<{ success: boolean; error?: string }>;
  remove: (productId: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isSessionLoading = status === "loading";

  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoaded(true);
      return;
    }

    try {
      const wishlistItems = await getWishlist();
      setItems(wishlistItems as WishlistItem[]);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [isAuthenticated]);

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    if (!isSessionLoading) {
      fetchWishlist();
    }
  }, [isSessionLoading, fetchWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  // Toggle wishlist
  const toggle = useCallback(
    async (
      productId: string
    ): Promise<{ success: boolean; action?: string; error?: string }> => {
      if (!isAuthenticated) {
        return { success: false, error: "লগইন করুন" };
      }

      return new Promise((resolve) => {
        startTransition(async () => {
          const result = await toggleWishlist(productId);

          if (result.success) {
            // Optimistic update
            if (result.action === "removed") {
              setItems((prev) =>
                prev.filter((item) => item.productId !== productId)
              );
            } else {
              // Re-fetch to get full product data
              await fetchWishlist();
            }
          }

          resolve(result);
        });
      });
    },
    [isAuthenticated, fetchWishlist]
  );

  // Add to wishlist
  const add = useCallback(
    async (
      productId: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isAuthenticated) {
        return { success: false, error: "লগইন করুন" };
      }

      return new Promise((resolve) => {
        startTransition(async () => {
          const result = await addToWishlist(productId);

          if (result.success) {
            await fetchWishlist();
          }

          resolve(result);
        });
      });
    },
    [isAuthenticated, fetchWishlist]
  );

  // Remove from wishlist
  const remove = useCallback(
    async (
      productId: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isAuthenticated) {
        return { success: false, error: "লগইন করুন" };
      }

      return new Promise((resolve) => {
        startTransition(async () => {
          const result = await removeFromWishlist(productId);

          if (result.success) {
            setItems((prev) =>
              prev.filter((item) => item.productId !== productId)
            );
          }

          resolve(result);
        });
      });
    },
    [isAuthenticated]
  );

  // Refresh wishlist
  const refresh = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  return {
    items,
    isLoading: isSessionLoading || !isLoaded,
    isPending,
    itemCount: items.length,
    isAuthenticated,
    isInWishlist,
    toggle,
    add,
    remove,
    refresh,
  };
}
