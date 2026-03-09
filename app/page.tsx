import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/home/hero-banner";
import { OfferBanner } from "@/components/home/offer-banner";
import { Newsletter } from "@/components/home/newsletter";
import { BlogCard } from "@/components/home/blog-card";
import { ProductCard } from "@/components/product/product-card";
import { CategoryCard } from "@/components/product/category-card";
import {
  Section,
  SectionHeader,
  ProductGrid,
  CategoryGrid,
} from "@/components/ui/section";
import {
  getCategories,
  getBestsellers,
  getNewArrivals,
} from "@/lib/actions/products";
import { blogPosts } from "@/lib/data";

export default async function HomePage() {
  const [categoriesData, bestsellersData, newArrivalsData] = await Promise.all([
    getCategories(),
    getBestsellers(4),
    getNewArrivals(4),
  ]);

  // Transform categories for CategoryCard component
  const categories = categoriesData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    nameEn: cat.nameEn,
    image:
      cat.image ||
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
    href: `/products?category=${cat.slug}`,
    productCount: cat._count.products,
  }));

  // Transform products for ProductCard component
  const bestsellers = bestsellersData.map((product) => ({
    id: product.id,
    name: product.name,
    nameEn: product.nameEn || undefined,
    price: product.price,
    mrp: product.mrp || undefined,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.inStock,
    isNew: product.isNew,
    hasCOD: product.hasCOD,
    category: product.category?.slug || "",
  }));

  const newArrivals = newArrivalsData.map((product) => ({
    id: product.id,
    name: product.name,
    nameEn: product.nameEn || undefined,
    price: product.price,
    mrp: product.mrp || undefined,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.inStock,
    isNew: product.isNew,
    hasCOD: product.hasCOD,
    category: product.category?.slug || "",
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Banner */}
        <HeroBanner />

        {/* Categories Section */}
        <Section>
          <SectionHeader
            title="ক্যাটাগরি"
            subtitle="আপনার পছন্দের পণ্য খুঁজুন"
            href="/products"
          />
          <CategoryGrid>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </CategoryGrid>
        </Section>

        {/* Bestsellers Section */}
        <Section className="bg-muted/50">
          <SectionHeader
            title="বেস্টসেলার পণ্য"
            subtitle="সবচেয়ে জনপ্রিয় পণ্য"
            href="/products?sort=bestseller"
          />
          <ProductGrid>
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        </Section>

        {/* Offer Banner */}
        <OfferBanner
          title="বিকাশ/নগদে পেমেন্ট করলে ৫% ক্যাশব্যাক"
          description="যেকোনো অর্ডারে বিকাশ বা নগদে পেমেন্ট করলে পাচ্ছেন ৫% ক্যাশব্যাক"
          ctaText="অর্ডার করুন"
          ctaHref="/products"
        />

        {/* New Arrivals Section */}
        <Section>
          <SectionHeader
            title="নতুন পণ্য"
            subtitle="সদ্য এসেছে আমাদের স্টোরে"
            href="/products?sort=newest"
          />
          <ProductGrid>
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        </Section>

        {/* Cat Care Tips Blog Section */}
        <Section className="bg-muted/50">
          <SectionHeader
            title="ক্যাট কেয়ার টিপস"
            subtitle="আপনার বিড়ালের যত্নে প্রয়োজনীয় টিপস"
            href="/blog"
            linkText="সব পোস্ট দেখুন"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Section>

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
