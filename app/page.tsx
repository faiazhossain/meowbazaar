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

// Static blog posts for homepage
const blogPosts = [
  {
    id: "1",
    title: "কুকুরের খাবার নির্বাচনের সম্পূর্ণ গাইড",
    titleEn: "Complete Guide to Choosing Dog Food",
    excerpt:
      "আপনার কুকুরের বয়স, জাত এবং স্বাস্থ্য অনুযায়ী সঠিক খাবার বেছে নিন।",
    excerptEn:
      "Choose the right food based on your dog's age, breed and health.",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    href: "/blog/dog-food-guide",
    date: "২৫ ফেব্রুয়ারি, ২০২৬",
    dateEn: "February 25, 2026",
    petType: "dog",
  },
  {
    id: "2",
    title: "বিড়ালের খাবার নির্বাচনের গাইড",
    titleEn: "Guide to Choosing Cat Food",
    excerpt:
      "আপনার বিড়ালের বয়স, স্বাস্থ্য এবং পছন্দ অনুযায়ী সঠিক খাবার নির্বাচন করুন।",
    excerptEn:
      "Choose the right food based on your cat's age, health and preferences.",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop",
    href: "/blog/cat-food-guide",
    date: "২০ ফেব্রুয়ারি, ২০২৬",
    dateEn: "February 20, 2026",
    petType: "cat",
  },
  {
    id: "3",
    title: "পোষা পাখির যত্ন ও খাওয়ানো",
    titleEn: "Pet Bird Care and Feeding",
    excerpt:
      "বাজরিগার, ফিঞ্চ ও অন্যান্য পাখির সঠিক যত্ন এবং খাবারের নির্দেশিকা।",
    excerptEn:
      "Proper care and feeding guide for budgies, finches and other birds.",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop",
    href: "/blog/bird-care-guide",
    date: "১৫ ফেব্রুয়ারি, ২০২৬",
    dateEn: "February 15, 2026",
    petType: "bird",
  },
];

export default async function HomePage() {
  const [categoriesData, bestsellersData, newArrivalsData, activeOffers] =
    await Promise.all([
      getCategories(),
      getBestsellers(4),
      getNewArrivals(4),
      getActiveOffers(),
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
