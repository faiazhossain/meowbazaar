"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import type { ActivityType } from "@prisma/client";

// Get client info from headers
async function getClientInfo() {
  const headersList = await headers();
  return {
    ipAddress:
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown",
    userAgent: headersList.get("user-agent") || "unknown",
  };
}

// Track user activity
export async function trackActivity(
  type: ActivityType,
  metadata?: Record<string, unknown>
) {
  try {
    const session = await auth();
    const clientInfo = await getClientInfo();

    await db.userActivity.create({
      data: {
        userId: session?.user?.id || null,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Track activity error:", error);
    return { success: false };
  }
}

// Track product view
export async function trackProductView(productId: string, productName: string) {
  return trackActivity("PRODUCT_VIEW", { productId, productName });
}

// Track search
export async function trackSearch(query: string, resultsCount: number) {
  return trackActivity("SEARCH", { query, resultsCount });
}

// Track add to cart
export async function trackAddToCart(productId: string, quantity: number) {
  return trackActivity("ADD_TO_CART", { productId, quantity });
}

// Track checkout start
export async function trackCheckoutStart(cartTotal: number, itemCount: number) {
  return trackActivity("CHECKOUT_START", { cartTotal, itemCount });
}

// Track order placed
export async function trackOrderPlaced(orderId: string, total: number) {
  return trackActivity("ORDER_PLACED", { orderId, total });
}

// Record login attempt
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  userId?: string,
  failReason?: string
) {
  try {
    const clientInfo = await getClientInfo();

    await db.loginAttempt.create({
      data: {
        email,
        userId: userId || null,
        success,
        failReason: failReason || null,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });

    // Update user's login stats if successful
    if (success && userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
        },
      });
    }

    // Create admin notification for failed login attempts (potential security issue)
    if (!success) {
      const recentFailedAttempts = await db.loginAttempt.count({
        where: {
          email,
          success: false,
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 min
        },
      });

      if (recentFailedAttempts >= 5) {
        await db.adminNotification.create({
          data: {
            type: "SECURITY",
            title: "Multiple Failed Login Attempts",
            message: `${recentFailedAttempts} failed login attempts for ${email} in the last 15 minutes.`,
            metadata: JSON.stringify({ email, attempts: recentFailedAttempts }),
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Record login attempt error:", error);
    return { success: false };
  }
}

// Record registration
export async function recordRegistration(userId: string, email: string) {
  try {
    await trackActivity("REGISTER", { userId, email });

    // Create admin notification for new registration
    await db.adminNotification.create({
      data: {
        type: "NEW_USER",
        title: "New User Registration",
        message: `New user registered: ${email}`,
        metadata: JSON.stringify({ userId, email }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Record registration error:", error);
    return { success: false };
  }
}

// Update daily analytics (called by cron or after significant events)
export async function updateDailyAnalytics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const [totalVisitors, uniqueVisitors, newRegistrations, orders] =
      await Promise.all([
        db.userActivity.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        db.userActivity.groupBy({
          by: ["userId"],
          where: {
            createdAt: { gte: today, lt: tomorrow },
            userId: { not: null },
          },
        }),
        db.user.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        db.order.findMany({
          where: {
            createdAt: { gte: today, lt: tomorrow },
          },
          select: {
            total: true,
          },
        }),
      ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get top products
    const topProductsData = await db.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: today, lt: tomorrow },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    await db.dailyAnalytics.upsert({
      where: { date: today },
      update: {
        totalVisitors,
        uniqueVisitors: uniqueVisitors.length,
        newRegistrations,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
        topProducts: JSON.stringify(topProductsData.map((p) => p.productId)),
      },
      create: {
        date: today,
        totalVisitors,
        uniqueVisitors: uniqueVisitors.length,
        newRegistrations,
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
        topProducts: JSON.stringify(topProductsData.map((p) => p.productId)),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update daily analytics error:", error);
    return { success: false };
  }
}

// Get dashboard stats for admin
export async function getDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      recentUsers,
      unreadNotifications,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: thisMonth } },
      }),
      db.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
      }),
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: thisMonth } } }),
      db.order.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      }),
      db.order.aggregate({
        where: { createdAt: { gte: thisMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      db.order.count({ where: { status: "PENDING" } }),
      db.product.count(),
      db.product.count({ where: { stock: { lte: 5 } } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1 },
        },
      }),
      db.user.findMany({
        take: 5,
        where: { role: "CUSTOMER" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      db.adminNotification.count({ where: { isRead: false } }),
    ]);

    // Calculate percentage changes
    const usersChange =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : newUsersThisMonth > 0
          ? 100
          : 0;

    const ordersChange =
      ordersLastMonth > 0
        ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
        : ordersThisMonth > 0
          ? 100
          : 0;

    const thisMonthRevenue = revenueThisMonth._sum.total || 0;
    const lastMonthRevenueTotal = revenueLastMonth._sum.total || 0;
    const revenueChange =
      lastMonthRevenueTotal > 0
        ? ((thisMonthRevenue - lastMonthRevenueTotal) / lastMonthRevenueTotal) *
          100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    return {
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersThisMonth,
          usersChange: Math.round(usersChange),
          totalOrders,
          ordersThisMonth,
          ordersChange: Math.round(ordersChange),
          revenueThisMonth: thisMonthRevenue,
          revenueChange: Math.round(revenueChange),
          pendingOrders,
          totalProducts,
          lowStockProducts,
        },
        recentOrders,
        recentUsers,
        unreadNotifications,
      },
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

// Get analytics data for charts and analytics page
export async function getAnalyticsData(period: string = "30d") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    // Parse period
    let days = 30;
    if (period === "7d") days = 7;
    else if (period === "30d") days = 30;
    else if (period === "90d") days = 90;
    else if (period === "all") days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get overview stats
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      newUsersToday,
      ordersToday,
      revenueTodayData,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.order.count({ where: { createdAt: { gte: startDate } } }),
      db.order.aggregate({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: startDate } },
        _sum: { total: true },
      }),
      db.product.count(),
      db.user.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      db.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      db.order.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
    ]);

    // Get recent activities
    const recentActivities = await db.userActivity.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        metadata: true,
        userId: true,
        createdAt: true,
      },
    });

    // Transform activities for display
    const activityDescriptions: Record<string, string> = {
      PRODUCT_VIEW: "প্রোডাক্ট দেখেছে",
      SEARCH: "সার্চ করেছে",
      ADD_TO_CART: "কার্টে যোগ করেছে",
      CHECKOUT_START: "চেকআউট শুরু করেছে",
      ORDER_PLACED: "অর্ডার করেছে",
      REGISTER: "রেজিস্টার করেছে",
      LOGIN: "লগইন করেছে",
    };

    const formattedActivities = recentActivities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activityDescriptions[activity.type] || activity.type,
      userId: activity.userId,
      createdAt: activity.createdAt,
    }));

    // Get recent login attempts
    const recentLogins = await db.loginAttempt.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        success: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    // Get top selling products
    const topProductsData = await db.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const productIds = topProductsData.map((p) => p.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const topProducts = topProductsData.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        id: tp.productId,
        name: product?.name || "Unknown",
        totalSold: tp._sum.quantity || 0,
        revenue: tp._sum.price || 0,
      };
    });

    // Get orders by status
    const orderStatusData = await db.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    const ordersByStatus: Record<string, number> = {};
    orderStatusData.forEach((item) => {
      ordersByStatus[item.status] = item._count;
    });

    // Get daily stats for charts
    const dailyAnalytics = await db.dailyAnalytics.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: "desc" },
      take: days,
    });

    const dailyStats = dailyAnalytics.map((day) => ({
      date: day.date,
      orders: day.totalOrders,
      revenue: day.totalRevenue,
      users: day.newRegistrations,
    }));

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProducts,
      newUsersToday,
      ordersToday,
      revenueToday: revenueTodayData._sum.total || 0,
      recentActivities: formattedActivities,
      recentLogins,
      topProducts,
      ordersByStatus,
      dailyStats,
    };
  } catch (error) {
    console.error("Get analytics data error:", error);
    return null;
  }
}
