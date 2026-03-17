"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface BlogPostData {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  image: string;
  category: string;
  petType: string;
  published?: boolean;
  featured?: boolean;
}

export interface BlogPostResult {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  image: string;
  category: string;
  petType: string;
  published: boolean;
  featured: boolean;
  viewCount: number;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

/**
 * Create a new blog post (admin only)
 * @param data - Blog post data
 * @returns Created blog post
 */
export async function createBlogPost(
  data: BlogPostData
): Promise<{ success: boolean; data?: BlogPostResult; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    // Check if slug already exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return { success: false, error: "এই স্লাগটি আগে থেকেই ব্যবহৃত হচ্ছে" };
    }

    const blogPost = await db.blogPost.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        slug: data.slug,
        excerpt: data.excerpt,
        excerptEn: data.excerptEn,
        content: data.content,
        contentEn: data.contentEn,
        image: data.image,
        category: data.category,
        petType: data.petType,
        published: data.published ?? false,
        featured: data.featured ?? false,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath("/blog");
    revalidatePath("/admin/blog");

    return { success: true, data: blogPost as BlogPostResult };
  } catch (error) {
    console.error("Create blog post error:", error);
    return { success: false, error: "ব্লগ পোস্ট তৈরি করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Update a blog post (admin only)
 * @param id - Blog post ID
 * @param data - Updated blog post data
 * @returns Updated blog post
 */
export async function updateBlogPost(
  id: string,
  data: Partial<BlogPostData>
): Promise<{ success: boolean; data?: BlogPostResult; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const blogPost = await db.blogPost.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleEn && { titleEn: data.titleEn }),
        ...(data.slug && { slug: data.slug }),
        ...(data.excerpt && { excerpt: data.excerpt }),
        ...(data.excerptEn && { excerptEn: data.excerptEn }),
        ...(data.content && { content: data.content }),
        ...(data.contentEn && { contentEn: data.contentEn }),
        ...(data.image && { image: data.image }),
        ...(data.category && { category: data.category }),
        ...(data.petType && { petType: data.petType }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.featured !== undefined && { featured: data.featured }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${blogPost.slug}`);
    revalidatePath("/admin/blog");

    return { success: true, data: blogPost as BlogPostResult };
  } catch (error) {
    console.error("Update blog post error:", error);
    return { success: false, error: "ব্লগ পোস্ট আপডেট করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Delete a blog post (admin only)
 * @param id - Blog post ID
 * @returns Deletion result
 */
export async function deleteBlogPost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const blogPost = await db.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!blogPost) {
      return { success: false, error: "ব্লগ পোস্ট পাওয়া যায়নি" };
    }

    await db.blogPost.delete({
      where: { id },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${blogPost.slug}`);
    revalidatePath("/admin/blog");

    return { success: true };
  } catch (error) {
    console.error("Delete blog post error:", error);
    return { success: false, error: "ব্লগ পোস্ট মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Get published blog posts
 * @param options - Pagination and filtering options
 * @returns Array of blog posts
 */
export async function getPublishedBlogPosts(options?: {
  page?: number;
  limit?: number;
  category?: string;
  petType?: string;
  featured?: boolean;
}): Promise<{ posts: BlogPostResult[]; total: number; page: number }> {
  try {
    const where: any = { published: true };

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.petType) {
      where.petType = options.petType;
    }

    if (options?.featured !== undefined) {
      where.featured = options.featured;
    }

    const skip = options?.page
      ? (options.page - 1) * (options?.limit || 10)
      : 0;

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: options?.limit || 10,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      db.blogPost.count({ where }),
    ]);

    return {
      posts: posts as BlogPostResult[],
      total,
      page: options?.page || 1,
    };
  } catch (error) {
    console.error("Get published blog posts error:", error);
    return { posts: [], total: 0, page: 1 };
  }
}

/**
 * Get all blog posts (admin only)
 * @param options - Pagination and filtering options
 * @returns Array of blog posts
 */
export async function getAllBlogPosts(options?: {
  page?: number;
  limit?: number;
  category?: string;
  petType?: string;
  published?: boolean;
}): Promise<{ posts: BlogPostResult[]; total: number; page: number }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { posts: [], total: 0, page: 1 };
  }

  try {
    const where: any = {};

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.petType) {
      where.petType = options.petType;
    }

    if (options?.published !== undefined) {
      where.published = options.published;
    }

    const skip = options?.page
      ? (options.page - 1) * (options?.limit || 20)
      : 0;

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: options?.limit || 20,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      db.blogPost.count({ where }),
    ]);

    return {
      posts: posts as BlogPostResult[],
      total,
      page: options?.page || 1,
    };
  } catch (error) {
    console.error("Get all blog posts error:", error);
    return { posts: [], total: 0, page: 1 };
  }
}

/**
 * Get a single blog post by slug
 * @param slug - Blog post slug (may be URL-encoded)
 * @returns Blog post
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostResult | null> {
  try {
    // Decode URL-encoded slug (handles Bengali characters)
    const decodedSlug = decodeURIComponent(slug);

    const blogPost = await db.blogPost.findUnique({
      where: { slug: decodedSlug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!blogPost || !blogPost.published) {
      return null;
    }

    // Increment view count
    await db.blogPost.update({
      where: { id: blogPost.id },
      data: { viewCount: { increment: 1 } },
    });

    return blogPost as BlogPostResult;
  } catch (error) {
    console.error("Get blog post error:", error);
    return null;
  }
}

/**
 * Get related blog posts
 * @param postId - Blog post ID
 * @param category - Post category
 * @param limit - Number of posts to return
 * @returns Related blog posts
 */
export async function getRelatedBlogPosts(
  postId: string,
  category: string,
  limit: number = 3
): Promise<BlogPostResult[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        published: true,
        category,
        id: { not: postId },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return posts as BlogPostResult[];
  } catch (error) {
    console.error("Get related blog posts error:", error);
    return [];
  }
}

/**
 * Get blog categories
 * @returns Array of unique categories
 */
export async function getBlogCategories(): Promise<string[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    });

    return posts.map((p) => p.category);
  } catch (error) {
    console.error("Get blog categories error:", error);
    return [];
  }
}

/**
 * Get featured blog posts
 * @param limit - Number of posts to return
 * @returns Featured blog posts
 */
export async function getFeaturedBlogPosts(limit: number = 6): Promise<BlogPostResult[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        published: true,
        featured: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return posts as BlogPostResult[];
  } catch (error) {
    console.error("Get featured blog posts error:", error);
    return [];
  }
}

/**
 * Get a blog post by ID (admin only)
 * @param id - Blog post ID
 * @returns Blog post
 */
export async function getBlogPostById(
  id: string
): Promise<BlogPostResult | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  try {
    const blogPost = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return blogPost as BlogPostResult;
  } catch (error) {
    console.error("Get blog post by ID error:", error);
    return null;
  }
}
