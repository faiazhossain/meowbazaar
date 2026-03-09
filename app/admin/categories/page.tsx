import { Suspense } from "react";
import { getAdminCategories } from "@/lib/actions/admin";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesClient initialCategories={categories} />
    </Suspense>
  );
}

function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
