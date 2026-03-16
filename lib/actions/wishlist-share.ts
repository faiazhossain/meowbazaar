"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

// Generate a unique token for sharing
function generateToken(): string {
  return randomBytes(12).toString("hex");
}

interface SharedWishlistWithProducts {
  id: string;
  token: string;
  viewCount: number;
  createdAt: Date;
  user: {
    name: string | null;
  };
  products: {
    id: string;
    name: string;
    nameEn: string | null;
    price: number;
    mrp: number | null;
    image: string;
    stock: number;
    inStock: boolean;
    category: {
      name: string;
      slug: string;
    };
  }[];
}

export async function createSharedWishlist(expiresInDays?: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Generate unique token
    const token = generateToken();

    // Calculate expiration date if provided
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create shared wishlist entry
    const sharedWishlist = await db.sharedWishlist.create({
      data: {
        userId: session.user.id,
        token,
        expiresAt,
      },
    });

    revalidatePath("/account/wishlist");

    return {
      success: true,
      token: sharedWishlist.token,
      expiresAt: sharedWishlist.expiresAt,
    };
  } catch (error) {
    console.error("Error creating shared wishlist:", error);
    return { success: false, error: "Failed to create share link" };
  }
}

export async function getSharedWishlistByToken(token: string): Promise<SharedWishlistWithProducts | null> {
  try {
    // Find the shared wishlist entry
    const sharedWishlist = await db.sharedWishlist.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!sharedWishlist) {
      return null;
      }

    // Check if expired
    if (sharedWishlist.expiresAt && new Date() > sharedWishlist.expiresAt) {
      return null;
      }

    // Increment view count
    await db.sharedWishlist.update({
      where: { token },
      data: { viewCount: { increment: 1 } },
    });

    // Get user's wishlist products
    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: sharedWishlist.userId },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      id: sharedWishlist.id,
      token: sharedWishlist.token,
      viewCount: sharedWishlist.viewCount + 1,
      createdAt: sharedWishlist.createdAt,
      user: sharedWishlist.user,
      products: wishlistItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        nameEn: item.product.nameEn,
        price: item.product.price,
        mrp: item.product.mrp,
        image: item.product.image,
        stock: item.product.stock,
        inStock: item.product.inStock,
        category: item.product.category,
      })),
    };
  } catch (error) {
    console.error("Error fetching shared wishlist:", error);
    return null;
  }
}

export async function getUserSharedWishlists() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const sharedWishlists = await db.sharedWishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return sharedWishlists;
  } catch (error) {
    console.error("Error fetching user shared wishlists:", error);
    return [];
  }
}

export async function deleteSharedWishlist(token: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const sharedWishlist = await db.sharedWishlist.findUnique({
      where: { token },
    });

    if (!sharedWishlist || sharedWishlist.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.sharedWishlist.delete({
      where: { token },
    });

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Error deleting shared wishlist:", error);
    return { success: false, error: "Failed to delete" };
  }
}
