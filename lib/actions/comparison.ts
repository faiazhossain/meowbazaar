"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COMPARISON_COOKIE_NAME = "comparison_items";
const MAX_COMPARISON_ITEMS = 4;

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

function getGuestComparisonIds(): string[] {
  try {
    const cookieStore = cookies();
    const comparisonCookie = cookieStore.get(COMPARISON_COOKIE_NAME);
    if (comparisonCookie?.value) {
      return JSON.parse(comparisonCookie.value);
    }
  } catch (error) {
    console.error("Error reading comparison cookie:", error);
  }
  return [];
}

function saveGuestComparisonIds(ids: string[]): void {
  try {
    const cookieStore = cookies();
    cookieStore.set(COMPARISON_COOKIE_NAME, JSON.stringify(ids), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("Error saving comparison cookie:", error);
  }
}

export async function addToComparison(productId: string) {
  try {
    const session = await auth();

    if (session?.user?.id) {
      const existingCount = await db.compareItem.count({
        where: { userId: session.user.id },
      });

      if (existingCount >= MAX_COMPARISON_ITEMS) {
        return {
          success: false,
          error: `Maximum ${MAX_COMPARISON_ITEMS} products can be compared`,
        };
      }

      const existing = await db.compareItem.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });

      if (existing) {
        return { success: true, message: "Already in comparison" };
      }

      await db.compareItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });

      revalidatePath("/compare");
      return { success: true };
    } else {
      const ids = getGuestComparisonIds();

      if (ids.length >= MAX_COMPARISON_ITEMS) {
        return {
          success: false,
          error: `Maximum ${MAX_COMPARISON_ITEMS} products can be compared`,
        };
      }

      if (ids.includes(productId)) {
        return { success: true, message: "Already in comparison" };
      }

      ids.push(productId);
      saveGuestComparisonIds(ids);

      revalidatePath("/compare");
      return { success: true };
    }
  } catch (error) {
    console.error("Error adding to comparison:", error);
    return { success: false, error: "Failed to add to comparison" };
  }
}

export async function removeFromComparison(productId: string) {
  try {
    const session = await auth();

    if (session?.user?.id) {
      await db.compareItem.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      });
    } else {
      const ids = getGuestComparisonIds();
      const filteredIds = ids.filter((id) => id !== productId);
      saveGuestComparisonIds(filteredIds);
    }

    revalidatePath("/compare");
    return { success: true };
  } catch (error) {
    console.error("Error removing from comparison:", error);
    return { success: false, error: "Failed to remove from comparison" };
  }
}

export async function clearComparison() {
  try {
    const session = await auth();

    if (session?.user?.id) {
      await db.compareItem.deleteMany({
        where: { userId: session.user.id },
      });
    } else {
      saveGuestComparisonIds([]);
    }

    revalidatePath("/compare");
    return { success: true };
  } catch (error) {
    console.error("Error clearing comparison:", error);
    return { success: false, error: "Failed to clear comparison" };
  }
}

export async function getComparisonItems(): Promise<ComparisonProduct[]> {
  try {
    const session = await auth();
    let productIds: string[] = [];

    if (session?.user?.id) {
      const items = await db.compareItem.findMany({
        where: { userId: session.user.id },
        select: { productId: true },
        orderBy: { createdAt: "asc" },
      });
      productIds = items.map((item) => item.productId);
    } else {
      productIds = getGuestComparisonIds();
    }

    if (productIds.length === 0) {
      return [];
    }

    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map((product) => ({
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        stock: product.stock,
        inStock: product.inStock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        hasCOD: product.hasCOD,
        category: product.category,
      }));
  } catch (error) {
    console.error("Error fetching comparison items:", error);
    return [];
  }
}

export async function getComparisonCount(): Promise<number> {
  try {
    const session = await auth();

    if (session?.user?.id) {
    return await db.compareItem.count({
      where: { userId: session.user.id },
    });
    } else {
      return getGuestComparisonIds().length;
    }
  } catch (error) {
    console.error("Error getting comparison count:", error);
    return 0;
  }
}
