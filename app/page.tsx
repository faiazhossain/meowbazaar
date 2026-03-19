import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/home/hero-banner";
import { Newsletter } from "@/components/home/newsletter";
import { BlogCard } from "@/components/home/blog-card";
import { ProductCard } from "@/components/product/product-card";
import { CategoryCard } from "@/components/product/category-card";
import {
  SectionHeaderClient,
  OfferBannerClient,
} from "@/components/home/home-sections";
import { Section, ProductGrid, CategoryGrid } from "@/components/ui/section";
import {
  getCategories,
  getBestsellers,
  getNewArrivals,
} from "@/lib/actions/products";
import { getActiveOffers } from "@/lib/actions/admin";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Button } from "@/components/ui/button";
import { getFeaturedBlogPosts } from "@/lib/actions/blog";

// Force dynamic rendering to avoid database calls during build
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categoriesData, bestsellersData, newArrivalsData, activeOffers, blogPosts] =
    await Promise.all([
      getCategories(),
      getBestsellers(4),
      getNewArrivals(4),
      getActiveOffers(),
      getFeaturedBlogPosts(3),
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
          <SectionHeaderClient
            titleKey="sections.categories"
            subtitleKey="sections.findProducts"
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
          <SectionHeaderClient
            titleKey="sections.bestsellers"
            subtitleKey="sections.popularProducts"
            href="/products?sort=bestseller"
          />
          <ProductGrid>
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        </Section>

        {/* Offer Banners */}
        {activeOffers.length > 0 &&
          activeOffers.map((offer) => (
            <DynamicOfferBanner key={offer.id} offer={offer} />
          ))}

        {/* New Arrivals Section */}
        <Section>
          <SectionHeaderClient
            titleKey="sections.newArrivals"
            subtitleKey="sections.justArrived"
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
          <SectionHeaderClient
            titleKey="sections.catCareTips"
            subtitleKey="sections.catCareSubtitle"
            href="/blog"
            linkTextKey="sections.viewAllPosts"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  titleEn: post.titleEn,
                  excerpt: post.excerpt,
                  excerptEn: post.excerptEn,
                  image: post.image,
                  href: `/blog/${post.slugEn || post.slug}`,
                  date: new Intl.DateTimeFormat("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(post.createdAt),
                  dateEn: new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(post.createdAt),
                  petType: post.petType,
                }}
              />
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

// Dynamic Offer Banner Component
interface DynamicOfferBannerProps {
  offer: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    ctaText: string;
    ctaTextEn: string;
    ctaLink: string;
    variant: string;
  };
}

function DynamicOfferBanner({ offer }: DynamicOfferBannerProps) {
  const bgClass =
    offer.variant === "primary"
      ? "bg-gradient-to-r from-primary to-brand-orange-dark"
      : "bg-gradient-to-r from-accent to-mint";

  const buttonText = offer.ctaText || offer.ctaTextEn;

  return (
    <section className={`${bgClass} py-10 md:py-14`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 text-balance">
          {offer.title}
        </h2>
        <p className="text-primary-foreground/90 text-lg mb-6 max-w-2xl mx-auto text-pretty">
          {offer.description}
        </p>
        <a href={offer.ctaLink}>
          <Button
            size="lg"
            className={
              offer.variant === "primary"
                ? "bg-card text-primary hover:bg-card/90"
                : "bg-card text-accent hover:bg-card/90"
            }
          >
            {buttonText}
          </Button>
        </a>
      </div>
    </section>
  );
}
