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
