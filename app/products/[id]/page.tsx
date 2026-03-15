import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts } from "@/lib/actions/products";
import { getProductReviews } from "@/lib/actions/reviews";
import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { ProductDetailsClient } from "./product-details-client";
import { auth } from "@/lib/auth";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId
  );

  // Fetch reviews and current user
  const reviews = await getProductReviews(id);
  const session = await auth();

  // Transform related products for ProductCard compatibility
  const transformedRelated = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn ?? undefined,
    price: p.price,
    mrp: p.mrp ?? undefined,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    isNew: p.isNew,
    hasCOD: p.hasCOD,
    category: product.category.name,
    categoryEn: product.category.nameEn ?? undefined,
    stock: p.stock,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <ProductDetailsClient
        product={{
          id: product.id,
          name: product.name,
          nameEn: product.nameEn ?? undefined,
          slug: product.slug,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          image: product.image,
          images: product.images,
          stock: product.stock,
          inStock: product.inStock,
          isNew: product.isNew,
          hasCOD: product.hasCOD,
          rating: product.rating,
          reviewCount: product.reviewCount,
          category: product.category,
        }}
        relatedProducts={transformedRelated}
        reviews={reviews}
        user={session?.user ? {
          id: session.user.id,
          name: session.user.name || null,
          email: session.user.email || null,
          image: session.user.image || null,
        } : null}
      />

      <Footer />
    </div>
  );
}
