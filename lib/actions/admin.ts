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

// Create category (Admin only)
export async function createCategory(
  name: string,
  nameEn: string,
  image?: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const slug = generateSlug(nameEn);

    const category = await db.category.create({
      data: {
        name,
        nameEn,
        slug,
        image,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "ক্যাটাগরি তৈরি করা যায়নি" };
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
