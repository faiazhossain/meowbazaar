"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: Date;
}

export async function getAdminNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  const notifications = await db.adminNotification.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return 0;
  }

  const count = await db.adminNotification.count({
    where: {
      isRead: false,
    },
  });

  return count;
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.adminNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}
