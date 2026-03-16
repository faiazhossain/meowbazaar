import { Suspense } from "react";
import { getProducts } from "@/lib/actions/products";
import { ProductsClient } from "../products/products-client";
import { Spinner } from "@/components/ui/spinner";

// Force dynamic rendering to avoid database calls during build
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "bestseller";
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const category = searchParams.category;
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1", 10);

  const productsData = await getProducts({
    search: query,
    category,
    sort,
    page,
    limit: 24,
  });

  return (
    <Suspense fallback={<SearchLoading />}>
      <ProductsClient
        initialProducts={productsData.products}
        total={productsData.total}
        pages={productsData.pages}
        currentPage={productsData.currentPage}
        searchQuery={query}
        selectedCategory={category}
        selectedSort={sort}
        showSearchOnly={true}
        title="ফলাফাতনের ফলামগস পাওয়ার্ড"
        titleEn="Search Results"
      />
    </Suspense>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground mt-4">খোঁজাছে চলসা সাধ্যন...</p>
      </div>
    </div>
  );
}
