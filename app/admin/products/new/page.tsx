import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminCategories } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const categoriesResult = await getAdminCategories();
  const categories = categoriesResult.categories || [];

  return (
    <div className="p-6">
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
