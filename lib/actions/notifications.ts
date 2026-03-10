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

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.adminNotification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllReadNotifications() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await db.adminNotification.deleteMany({
      where: { isRead: true },
    });

    revalidatePath("/admin");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Delete all read notifications error:", error);
    return { success: false, error: "Failed to delete read notifications" };
  }
}

export async function getNotificationsStats() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { total: 0, unread: 0, today: 0, thisWeek: 0 };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  try {
    const [total, unread, today, thisWeek] = await Promise.all([
      db.adminNotification.count(),
      db.adminNotification.count({ where: { isRead: false } }),
      db.adminNotification.count({ where: { createdAt: { gte: todayStart } } }),
      db.adminNotification.count({ where: { createdAt: { gte: weekStart } } }),
    ]);

    return { total, unread, today, thisWeek };
  } catch (error) {
    console.error("Get notifications stats error:", error);
    return { total: 0, unread: 0, today: 0, thisWeek: 0 };
  }
}

export async function getAllNotifications(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { notifications: [], total: 0 };
  }

  const { limit = 20, offset = 0, unreadOnly, type } = params || {};

  try {
    const where: { isRead?: boolean; type?: string } = {};
    if (unreadOnly) where.isRead = false;
    if (type && type !== "ALL") where.type = type;

    const [notifications, total] = await Promise.all([
      db.adminNotification.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      db.adminNotification.count({ where }),
    ]);

    return { notifications, total };
  } catch (error) {
    console.error("Get all notifications error:", error);
    return { notifications: [], total: 0 };
  }
}
