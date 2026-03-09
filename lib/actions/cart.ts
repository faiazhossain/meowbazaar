"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get user's cart with items
export async function getCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return cart;
}

// Add item to cart
export async function addToCart(productId: string, quantity: number = 1) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "কার্টে যোগ করা যায়নি" };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    if (quantity <= 0) {
      await db.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Update cart error:", error);
    return { success: false, error: "আপডেট করা যায়নি" };
  }
}

// Remove item from cart
export async function removeFromCart(cartItemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: "মুছে ফেলা যায়নি" };
  }
}

// Clear cart
export async function clearCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "কার্ট খালি করা যায়নি" };
  }
}

// Get cart items count
export async function getCartCount() {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
  });

  return cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
}
