import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/home/blog-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import { SectionHeaderClient } from "@/components/home/home-sections";
import { SectionHeader } from "@/components/ui/section";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.id, post.category, 3);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatDateEn = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              ব্লগে ফিরে যান
            </Button>
          </Link>
        </div>

        {/* Featured Image */}
        <div className="container mx-auto px-4">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            {post.featured && (
              <Badge className="absolute top-4 right-4 bg-primary">
                জনপ্রিয়
              </Badge>
            )}
          </div>
        </div>

        {/* Article Content */}
        <Section>
          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {post.author?.image ? (
                    <Image
                      src={post.author.image}
                      alt={post.author.name || "Author"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span>{post.author?.name || "PetBazaar Team"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} বার দেখেছেন</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{post.category}</Badge>
                <Badge variant="outline">{post.petType}</Badge>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="whitespace-pre-wrap"
              />
            </div>
          </article>
        </Section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Section className="bg-muted/50">
            <SectionHeader
              title="সম্পর্কিত পোস্ট"
              subtitle="আরও পড়ুন"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost.id}
                  post={{
                    id: relatedPost.id,
                    title: relatedPost.title,
                    titleEn: relatedPost.titleEn,
                    excerpt: relatedPost.excerpt,
                    excerptEn: relatedPost.excerptEn,
                    image: relatedPost.image,
                    href: `/blog/${relatedPost.slug}`,
                    date: formatDate(relatedPost.createdAt),
                    dateEn: formatDateEn(relatedPost.createdAt),
                    petType: relatedPost.petType,
                  }}
                />
              ))}
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
}
