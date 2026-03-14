"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ==================== CATEGORY ACTIONS ====================

interface CreateCategoryData {
  name: string;
  nameEn: string;
  image?: string;
  description?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// Get all categories with product count (Admin)
export async function getAdminCategories() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return categories;
}

// Get single category
export async function getCategoryById(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const category = await db.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return category;
}

// Create category (Admin only)
export async function createCategory(data: CreateCategoryData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const slug = generateSlug(data.nameEn) + "-" + Date.now();

    const category = await db.category.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug,
        image: data.image,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, category };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "ক্যাটাগরি তৈরি করা যায়নি" };
  }
}

// Update category (Admin only)
export async function updateCategory(data: UpdateCategoryData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const { id, ...updateData } = data;

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, category };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "ক্যাটাগরি আপডেট করা যায়নি" };
  }
}

// Delete category (Admin only)
export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `এই ক্যাটাগরিতে ${productCount} টি পণ্য আছে। প্রথমে পণ্যগুলো সরান।`,
      };
    }

    await db.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "ক্যাটাগরি মুছে ফেলা যায়নি" };
  }
}

// ==================== PRODUCT ACTIONS ====================

interface CreateProductData {
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  mrp?: number;
  image: string;
  images?: string[];
  categoryId: string;
  stock: number;
  isNew?: boolean;
  hasCOD?: boolean;
}

interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Get all products with category (Admin)
export async function getAdminProducts(options?: {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { products: [], total: 0 };
  }

  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { nameEn: { contains: options.search, mode: "insensitive" } },
    ];
  }

  if (options?.categoryId && options.categoryId !== "all") {
    where.categoryId = options.categoryId;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    db.product.count({ where }),
  ]);

  return { products, total };
}

// Get single product by ID
export async function getProductById(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই", product: null };
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return { success: false, error: "পণ্য পাওয়া যায়নি", product: null };
    }

    return { success: true, product };
  } catch {
    return { success: false, error: "পণ্য লোড করা যায়নি", product: null };
  }
}

// Create product (Admin only)
export async function createProduct(data: CreateProductData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const slug = generateSlug(data.nameEn || data.name) + "-" + Date.now();

    const product = await db.product.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug,
        description: data.description,
        price: data.price,
        mrp: data.mrp,
        image: data.image,
        images: data.images ? JSON.stringify(data.images) : null,
        categoryId: data.categoryId,
        stock: data.stock,
        inStock: data.stock > 0,
        isNew: data.isNew ?? true,
        hasCOD: data.hasCOD ?? true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, product };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "পণ্য তৈরি করা যায়নি" };
  }
}

// Update product (Admin only)
export async function updateProduct(data: UpdateProductData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const { id, ...updateData } = data;

    const product = await db.product.update({
      where: { id },
      data: {
        ...updateData,
        images: updateData.images
          ? JSON.stringify(updateData.images)
          : undefined,
        inStock:
          updateData.stock !== undefined ? updateData.stock > 0 : undefined,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, product };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "পণ্য আপডেট করা যায়নি" };
  }
}

// Delete product (Admin only)
export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "পণ্য মুছে ফেলা যায়নি" };
  }
}

// Update product stock (Admin only)
export async function updateProductStock(productId: string, stock: number) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        stock,
        inStock: stock > 0,
      },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Update stock error:", error);
    return { success: false, error: "স্টক আপডেট করা যায়নি" };
  }
}

// Get admin dashboard stats
export async function getAdminStats() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    db.order.count({
      where: {
        createdAt: { gte: today },
      },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    }),
    db.product.count(),
    db.user.count({
      where: { role: "CUSTOMER" },
    }),
    db.order.count({
      where: { status: "PENDING" },
    }),
    db.product.count({
      where: { stock: { lte: 10 } },
    }),
  ]);

  return {
    todayOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
  };
}

// Get all users (Admin only)
export async function getAllUsers() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

// ==================== CUSTOMER MANAGEMENT ====================

// Get customers with filters and pagination
export async function getCustomers(options?: {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { customers: [], total: 0 };
  }

  const where: Record<string, unknown> = {
    role: "CUSTOMER",
  };

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { email: { contains: options.search, mode: "insensitive" } },
      { phone: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        _count: {
          select: { orders: true, wishlist: true },
        },
        orders: {
          select: { total: true },
        },
      },
      orderBy: {
        [options?.sortBy || "createdAt"]: options?.sortOrder || "desc",
      },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    db.user.count({ where }),
  ]);

  // Calculate total spent for each customer
  const customersWithSpent = customers.map((customer) => ({
    ...customer,
    totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
    orders: undefined,
  }));

  return { customers: customersWithSpent, total };
}

// Get single customer details
export async function getCustomerById(customerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const customer = await db.user.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: true,
        },
      },
      addresses: true,
      wishlist: {
        include: {
          product: true,
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      loginAttempts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { orders: true, reviews: true, wishlist: true },
      },
    },
  });

  if (!customer) return null;

  // Calculate total spent
  const totalSpent = customer.orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return {
    ...customer,
    totalSpent,
  };
}

// Toggle customer active status
export async function toggleCustomerStatus(customerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const customer = await db.user.findUnique({
      where: { id: customerId },
      select: { isActive: true },
    });

    if (!customer) {
      return { success: false, error: "কাস্টমার পাওয়া যায়নি" };
    }

    await db.user.update({
      where: { id: customerId },
      data: { isActive: !customer.isActive },
    });

    revalidatePath("/admin/customers");
    return { success: true, isActive: !customer.isActive };
  } catch (error) {
    console.error("Toggle customer status error:", error);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন করা যায়নি" };
  }
}

// ==================== ORDER MANAGEMENT ====================

// Get orders with filters
export async function getOrders(options?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { orders: [], total: 0 };
  }

  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { orderNumber: { contains: options.search, mode: "insensitive" } },
      { user: { name: { contains: options.search, mode: "insensitive" } } },
      { user: { email: { contains: options.search, mode: "insensitive" } } },
    ];
  }

  if (options?.status && options.status !== "ALL") {
    where.status = options.status;
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        items: {
          include: { product: true },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        [options?.sortBy || "createdAt"]: options?.sortOrder || "desc",
      },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    db.order.count({ where }),
  ]);

  return { orders, total };
}

// Get single order details
export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      address: true,
      items: {
        include: {
          product: {
            select: { id: true, slug: true, image: true, name: true },
          },
        },
      },
      timeline: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return order;
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED",
  note?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Add timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId,
          status,
          note,
        },
      });

      // If delivered, update payment status
      if (status === "DELIVERED") {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID" },
        });
      }

      // If cancelled, restore stock
      if (status === "CANCELLED") {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
                inStock: true,
              },
            });
          }
        }
      }
    });

    // Create notification for status change
    await db.adminNotification.create({
      data: {
        type: "ORDER_STATUS",
        title: `অর্ডার স্ট্যাটাস পরিবর্তন`,
        message: `অর্ডার ${orderId} এর স্ট্যাটাস ${status} করা হয়েছে`,
        metadata: JSON.stringify({ orderId, status }),
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "স্ট্যাটাস আপডেট করা যায়নি" };
  }
}

// Get admin notifications
export async function getAdminNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  const where: Record<string, unknown> = {};
  if (options?.unreadOnly) {
    where.isRead = false;
  }

  const notifications = await db.adminNotification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
  });

  return notifications;
}

// Mark notification as read
export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false };
  }

  await db.adminNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return { success: true };
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false };
  }

  await db.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ==================== OFFER MANAGEMENT ====================

interface CreateOfferData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  ctaText?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  variant?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: Date;
  endDate?: Date;
}

interface UpdateOfferData extends Partial<CreateOfferData> {
  id: string;
}

// Get active offers for homepage
export async function getActiveOffers() {
  try {
    const now = new Date();

    const offers = await db.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return offers;
  } catch (error) {
    console.error("Get active offers error:", error);
    return [];
  }
}

// Get all offers for admin
export async function getAdminOffers() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  try {
    const offers = await db.offer.findMany({
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return offers;
  } catch (error) {
    console.error("Get admin offers error:", error);
    return [];
  }
}

// Get single offer by ID
export async function getOfferById(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  try {
    const offer = await db.offer.findUnique({
      where: { id },
    });

    return offer;
  } catch (error) {
    console.error("Get offer error:", error);
    return null;
  }
}

// Create offer (Admin only)
export async function createOffer(data: CreateOfferData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const offer = await db.offer.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        ctaText: data.ctaText || "এখনই অর্ডার করুন",
        ctaTextEn: data.ctaTextEn || "Order Now",
        ctaLink: data.ctaLink || "/products",
        variant: data.variant || "primary",
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");

    return { success: true, offer };
  } catch (error) {
    console.error("Create offer error:", error);
    return { success: false, error: "অফার তৈরি করা যায়নি" };
  }
}

// Update offer (Admin only)
export async function updateOffer(data: UpdateOfferData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const { id, ...updateData } = data;

    const offer = await db.offer.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");

    return { success: true, offer };
  } catch (error) {
    console.error("Update offer error:", error);
    return { success: false, error: "অফার আপডেট করা যায়নি" };
  }
}

// Delete offer (Admin only)
export async function deleteOffer(offerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.offer.delete({
      where: { id: offerId },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete offer error:", error);
    return { success: false, error: "অফার মুছে ফেলা যায়নি" };
  }
}

// Toggle offer active status (Admin only)
export async function toggleOffer(offerId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const offer = await db.offer.findUnique({
      where: { id: offerId },
      select: { isActive: true },
    });

    if (!offer) {
      return { success: false, error: "অফার পাওয়া যায়নি" };
    }

    await db.offer.update({
      where: { id: offerId },
      data: { isActive: !offer.isActive },
    });

    revalidatePath("/admin/offers");
    revalidatePath("/");

    return { success: true, isActive: !offer.isActive };
  } catch (error) {
    console.error("Toggle offer error:", error);
    return { success: false, error: "অফার স্ট্যাটাস পরিবর্তন করা যায়নি" };
  }
}
