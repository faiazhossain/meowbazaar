"use server";

import { db } from "@/lib/db";

export interface OrderTrackingData {
  orderNumber: string;
  status: string;
  estimatedDelivery?: string;
  timeline: {
    status: string;
    note?: string;
    date: string;
  }[];
}

/**
 * Track order by order number (public endpoint)
 * @param orderNumber - Order number
 * @returns Order tracking data
 */
export async function trackOrder(
  orderNumber: string
): Promise<{ success: boolean; data?: OrderTrackingData; error?: string }> {
  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    // Calculate estimated delivery (7 days from order date)
    const estimatedDelivery = new Date(order.createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const trackingData: OrderTrackingData = {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDelivery: estimatedDelivery.toISOString(),
      timeline: order.timeline.map((t) => ({
        status: t.status,
        note: t.note || undefined,
        date: t.createdAt.toISOString(),
      })),
    };

    return { success: true, data: trackingData };
  } catch (error) {
    console.error("Track order error:", error);
    return { success: false, error: "অর্ডার ট্র্যাক করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Get order details by ID (authenticated)
 * @param orderId - Order ID
 * @returns Order details
 */
export async function getOrderById(
  orderId: string,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        address: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Get order error:", error);
    return { success: false, error: "অর্ডার পেতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Cancel order
 * @param orderId - Order ID
 * @returns Cancellation result
 */
export async function cancelOrder(
  orderId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return { success: false, error: "অর্ডার পাওয়া যায়নি" };
    }

    // Can only cancel if order is in PENDING or CONFIRMED status
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return { success: false, error: "এই অর্ডারটি বাতিল করা যাবে না" };
    }

    // Update order status
    await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Add timeline entry
    await db.orderTimeline.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: "অর্ডার গ্রাহক দ্বারা বাতিল করা হয়েছে",
      },
    });

    // Restore stock
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Cancel order error:", error);
    return { success: false, error: "অর্ডার বাতিল করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Add order timeline entry (admin)
 * @param orderId - Order ID
 * @param status - Status
 * @param note - Optional note
 * @returns Result
 */
export async function addOrderTimeline(
  orderId: string,
  status: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.orderTimeline.create({
      data: {
        orderId,
        status,
        note,
      },
    });

    // Update order status if provided
    await db.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    return { success: true };
  } catch (error) {
    console.error("Add timeline error:", error);
    return { success: false, error: "টাইমলাইন যোগ করতে ব্যর্থ হয়েছে" };
  }
}
