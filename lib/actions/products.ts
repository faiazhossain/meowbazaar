"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface GetProductsOptions {
  category?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "bestseller";
  page?: number;
  limit?: number;
}

// Get products with filtering and sorting
export async function getProducts(options: GetProductsOptions = {}) {
  const { category, search, sort = "newest", page = 1, limit = 12 } = options;

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { nameEn: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "bestseller":
      orderBy = { reviewCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  return product;
}

// Get product by ID
export async function getProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  return product;
}

// Get related products
export async function getRelatedProducts(
  productId: string,
  categoryId: string
) {
  const products = await db.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    take: 4,
  });

  return products;
}

// Get all categories
export async function getCategories() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return categories;
}

// Get bestsellers
export async function getBestsellers(limit: number = 4) {
  const products = await db.product.findMany({
    where: { inStock: true },
    orderBy: { reviewCount: "desc" },
    take: limit,
    include: {
      category: true,
    },
  });

  return products;
}

// Get new arrivals
export async function getNewArrivals(limit: number = 4) {
  const products = await db.product.findMany({
    where: { isNew: true, inStock: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: true,
    },
  });

  return products;
}

// Get low stock products (for admin)
export async function getLowStockProducts(threshold: number = 10) {
  const products = await db.product.findMany({
    where: {
      stock: { lte: threshold },
    },
    orderBy: { stock: "asc" },
    take: 10,
  });

  return products;
}
