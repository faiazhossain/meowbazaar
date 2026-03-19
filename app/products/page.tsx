import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductsClient } from "./products-client";
import { Spinner } from "@/components/ui/spinner";

// Force dynamic rendering to avoid database calls during build
export const dynamic = "force-dynamic";

async function getProductsData() {
  const [products, categories, brands] = await Promise.all([
    db.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany(),
    db.brand.findMany(),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      nameEn: p.nameEn || undefined,
      price: p.price,
      mrp: p.mrp || undefined,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      inStock: p.inStock,
      isNew: p.isNew,
      hasCOD: p.hasCOD,
      category: p.category?.slug || "",
      brand: p.brand?.id || null,
      brandName: p.brand?.name || null,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn || undefined,
      slug: c.slug,
    })),
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      nameEn: b.nameEn || undefined,
      slug: b.slug,
    })),
  };
}

async function getUserData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, cartCount: 0, wishlistCount: 0 };
  }

  const [cart, wishlistCount] = await Promise.all([
    db.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    }),
    db.wishlistItem.count({
      where: { userId: session.user.id },
    }),
  ]);

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    cartCount: cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0,
    wishlistCount,
  };
}

function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const [{ products, categories, brands }, { user, cartCount, wishlistCount }] =
    await Promise.all([getProductsData(), getUserData()]);

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient
        initialProducts={products}
        categories={categories}
        brands={brands}
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </Suspense>
  );
}
