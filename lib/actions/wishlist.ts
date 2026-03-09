"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get user's wishlist
export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const wishlistItems = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return wishlistItems;
}

// Add to wishlist
export async function addToWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return { success: true, message: "ইতিমধ্যে উইশলিস্টে আছে" };
    }

    await db.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return { success: false, error: "উইশলিস্টে যোগ করা যায়নি" };
  }
}

// Remove from wishlist
export async function removeFromWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    await db.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    revalidatePath("/account/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return { success: false, error: "উইশলিস্ট থেকে মুছে ফেলা যায়নি" };
  }
}

// Toggle wishlist item
export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await db.wishlistItem.delete({
        where: { id: existing.id },
      });
      revalidatePath("/account/wishlist");
      return { success: true, action: "removed" };
    } else {
      await db.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      revalidatePath("/account/wishlist");
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return { success: false, error: "কিছু ভুল হয়েছে" };
  }
}

// Get wishlist count
export async function getWishlistCount() {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  const count = await db.wishlistItem.count({
    where: { userId: session.user.id },
  });

  return count;
}

// Check if product is in wishlist
export async function isInWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  return !!existing;
}
