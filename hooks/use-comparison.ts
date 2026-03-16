"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addToComparison,
  removeFromComparison,
  clearComparison,
  getComparisonItems,
  getComparisonCount,
} from "@/lib/actions/comparison";
import { toast } from "sonner";

interface ComparisonProduct {
  id: string;
  name: string;
  nameEn: string | null;
  price: number;
  mrp: number | null;
  image: string;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  hasCOD: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useComparison() {
  const [items, setItems] = useState<ComparisonProduct[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const [comparisonItems, comparisonCount] = await Promise.all([
        getComparisonItems(),
        getComparisonCount(),
      ]);
      setItems(comparisonItems as ComparisonProduct[]);
      setCount(comparisonCount);
    } catch (error) {
      console.error("Error fetching comparison items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const add = async (productId: string) => {
    const result = await addToComparison(productId);
    if (result.success) {
      await fetchItems();
      if (result.message) {
        toast.info(result.message);
      } else {
        toast.success("Added to comparison");
      }
    } else {
      toast.error(result.error || "Failed to add to comparison");
    }
    return result;
  };

  const remove = async (productId: string) => {
    const result = await removeFromComparison(productId);
    if (result.success) {
      await fetchItems();
      toast.success("Removed from comparison");
    } else {
      toast.error(result.error || "Failed to remove from comparison");
    }
    return result;
  };

  const clear = async () => {
    const result = await clearComparison();
    if (result.success) {
      setItems([]);
      setCount(0);
      toast.success("Comparison cleared");
    } else {
      toast.error(result.error || "Failed to clear comparison");
    }
    return result;
  };

  const isInComparison = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const refresh = fetchItems;

  return {
    items,
    count,
    isLoading,
    add,
    remove,
    clear,
    isInComparison,
    refresh,
  };
}
