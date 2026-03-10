"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import {
  triggerNewOrderNotification,
  NewOrderNotificationPayload,
} from "@/lib/pusher";

// Generate order number
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `MB${year}${month}${day}${random}`;
}

// Format currency for notifications
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface CreateOrderData {
  addressId: string;
  paymentMethod: string;
  notes?: string;
}

// Create a new order
export async function createOrder(data: CreateOrderData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Get user's cart
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "কার্ট খালি" };
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const deliveryFee = subtotal >= 500 ? 0 : 60;
    const total = subtotal + deliveryFee;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        addressId: data.addressId,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        },
        timeline: {
          create: {
            status: "অর্ডার প্লেসড",
            note: "অর্ডার সফলভাবে প্লেস করা হয়েছে",
          },
        },
      },
    });

    // Update product stock
    for (const item of cart.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Get user info for notification
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    // Create admin notification
    const adminNotification = await db.adminNotification.create({
      data: {
        type: "NEW_ORDER",
        title: "New Order Received",
        message: `Order ${order.orderNumber} - ${formatCurrency(total)} by ${user?.name || "Customer"}`,
        metadata: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: total,
          customerName: user?.name || "Customer",
        }),
      },
    });

    // Trigger Pusher notification for real-time update
    const notificationPayload: NewOrderNotificationPayload = {
      id: adminNotification.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      type: "NEW_ORDER",
      title: "New Order Received",
      message: `Order ${order.orderNumber} - ${formatCurrency(total)} by ${user?.name || "Customer"}`,
      total: total,
      customerName: user?.name || "Customer",
      createdAt: adminNotification.createdAt.toISOString(),
    };

    await triggerNewOrderNotification(notificationPayload);

    revalidatePath("/account/orders");
    revalidatePath("/cart");

    return { success: true, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Create order error:", error);
    return { success: false, error: "অর্ডার তৈরি করা যায়নি" };
  }
}

// Get user's orders
export async function getOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      address: true,
      timeline: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

// Get single order
export async function getOrder(orderNumber: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const order = await db.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
    },
    include: {
      items: true,
      address: true,
      timeline: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return order;
}

// Admin: Get all orders
export async function getAllOrders(status?: OrderStatus) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: true,
      address: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

// Admin: Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    const statusLabels: Record<OrderStatus, string> = {
      PENDING: "পেন্ডিং",
      CONFIRMED: "কনফার্মড",
      PROCESSING: "প্রসেসিং",
      SHIPPED: "শিপড",
      DELIVERED: "ডেলিভারড",
      CANCELLED: "বাতিল",
    };

    await db.orderTimeline.create({
      data: {
        orderId,
        status: statusLabels[status],
        note,
      },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "স্ট্যাটাস আপডেট করা যায়নি" };
  }
}
