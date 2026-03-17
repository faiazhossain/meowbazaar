import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { getPublishedBlogPosts, getBlogCategories } from "@/lib/actions/blog";
import { BlogCard } from "@/components/home/blog-card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { BlogFilter } from "@/components/blog/blog-filter";

// Force dynamic rendering to avoid database calls during build
export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    petType?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const category = searchParams.category;
  const petType = searchParams.petType;

  const [blogData, categories] = await Promise.all([
    getPublishedBlogPosts({
      page,
      limit: 12,
      category,
      petType,
    }),
    getBlogCategories(),
  ]);

  const totalPages = Math.ceil(blogData.total / 12);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-mint/10 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              পোষা যত্ন গাইড
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              আপনার পোষা যত্নের জন্য সেরা টিপস ও গাইড
            </p>
          </div>
        </div>

        {/* Filters */}
        <Section>
          <div className="flex flex-wrap gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <BlogFilter
                categories={categories}
                selectedCategory={category}
                selectedPetType={petType}
              />
            </div>

            {/* Clear Filters */}
            {(category || petType) && (
              <Button
                variant="outline"
                onClick={() => window.location.href = "/blog"}
              >
                ফিল্টার মুছুন
              </Button>
            )}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogData.posts.map((post) => (
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

          {/* No Posts */}
          {blogData.posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                কোনো ব্লগ পোস্ট পাওয়া যায়নি
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(page - 1));
                    window.location.href = `/blog?${params.toString()}`;
                  }}
                >
                  আগে
                </Button>
              )}

              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>

              {page < totalPages && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(page + 1));
                    window.location.href = `/blog?${params.toString()}`;
                  }}
                >
                  পরে
                </Button>
              )}
            </div>
          )}
        </Section>
      </main>

      <Footer />
    </div>
  );
}
