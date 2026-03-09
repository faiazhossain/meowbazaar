import { Suspense } from "react";
import {
  getAdminProducts,
  getAdminCategories,
} from "@/lib/actions/admin";
import { ProductsClient } from "./products-client";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const categoryId = params.category || "all";
  const page = parseInt(params.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const [productsData, categories] = await Promise.all([
    getAdminProducts({
      search,
      categoryId,
      limit,
      offset,
    }),
    getAdminCategories(),
  ]);

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient
        initialProducts={productsData.products}
        totalProducts={productsData.total}
        categories={categories}
        currentPage={page}
        pageSize={limit}
        searchQuery={search}
        categoryFilter={categoryId}
      />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      </div>
      <div className="bg-card rounded-lg overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-border bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
