import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminCategories, getProductById } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const [productResult, categories] = await Promise.all([
    getProductById(id),
    getAdminCategories(),
  ]);

  if (!productResult.success || !productResult.product) {
    notFound();
  }

  return (
    <div className="p-6">
      <ProductForm
        categories={categories}
        product={productResult.product}
        mode="edit"
      />
    </div>
  );
}
