"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResult {
  success: boolean;
  error?: string;
  review?: {
    id: string;
    userId: string;
    userName: string;
    userImage: string | null;
    rating: number;
    comment: string;
    createdAt: Date;
  updatedAt: Date;
  };
}

/**
 * Submit a product review
 * @param data - Review data including productId, rating, and optional comment
 * @returns Promise with success status and review data
 */
export async function submitReview(data: ReviewData): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Check if user already reviewed this product
    const existingReview = await db.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: data.productId,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: "আপনি ইতিম ধি রিভিউ দিয়েছে",
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "রেটিং � ১-৫ মোত্য়া হতে হবেন (১-৫)",
      };
    }

    // Validate comment length
    if (data.comment && data.comment.length > 1000) {
      return {
        success: false,
        error: "মন্তত্য়ার �র্মতকরুন",
      };
    }

    // Check if product exists and belongs to published category
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.categoryId) {
      return {
        success: false,
        error: "পণ্যটাক্ট পাওয়ার্ড নেই",
      };
    }

    // Create review
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment || null,
      },
    });

    // Update product rating
    const allReviews = await db.review.findMany({
      where: { productId: data.productId },
    select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: data.productId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    revalidatePath(`/products/${data.productId}`);

    const result: ReviewResult = {
      success: true,
      review: {
        id: review.id,
        userId: session.user.id,
        userName: session.user.name || "",
        userImage: session.user.image || null,
        rating: data.rating,
        comment: data.comment || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // Track review for analytics
    // Note: This would be handled by the product page calling trackActivity

    return result;
  } catch (error) {
    console.error("Submit review error:", error);
    return {
      success: false,
      error: "রিভিউ জামা করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

/**
 * Get reviews for a product
 * @param productId - Product ID
 * @returns Array of reviews with user information
 */
export async function getProductReviews(productId: string) {
  try {
    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || "",
      userImage: review.user.image || null,
      rating: review.rating,
      comment: review.comment || "",
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
  } catch (error) {
    console.error("Get product reviews error:", error);
    return [];
  }
}

/**
 * Update an existing review
 * @param reviewId - Review ID
 * @param data - Updated review data
 * @returns Promise with success status
 */
export async function updateReview(
  reviewId: string,
  data: { rating?: number; comment?: string }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Verify review belongs to user
    const existingReview = await db.review.findUnique({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
    });

    if (!existingReview) {
      return { success: false, error: "রিভিউ জামা পাওয়ার্ড নেই" };
    }

    // Update review
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    });

    revalidatePath(`/products/${existingReview.productId}`);

    return { success: true };
  } catch (error) {
    console.error("Update review error:", error);
    return { success: false, error: "রিভিউ জামা করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Delete a review
 * @param reviewId - Review ID
 * @returns Promise with success status
 */
export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Get review to get productId before deleting
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { productId: true },
    });

    if (!review) {
      return { success: false, error: "রিভিউ জামা পাওয়ার্ড নেই" };
    }

    const productId = review.productId;

    // Delete review
    await db.review.delete({
      where: { id: reviewId },
    });

    // Update product rating and review count
    const remainingReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: remainingReviews.length,
      },
    });

    revalidatePath(`/products/${productId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, error: "রিভিউ জামা করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Get user's reviews
 * @returns Array of reviews with product information
 */
export async function getUserReviews() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const reviews = await db.review.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        },
      orderBy: {
        createdAt: "desc",
        },
      take: 50,
    });

    return reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || "",
      userImage: review.user.image || null,
      rating: review.rating,
      comment: review.comment || "",
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
  } catch (error) {
    console.error("Get user reviews error:", error);
    return [];
  }
}

/**
 * Admin: Get all reviews for moderation
 * @param options - Pagination and filtering options
 */
export async function getAllReviews(options?: {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { reviews: [], total: 0, page: 1 };
  }

  try {
    const where: any = {};
    const skip = options?.page ? (options.page - 1) * (options?.limit || 20) : 0;

    if (options?.productId) {
      where.productId = options.productId;
    }

    if (options?.userId) {
      where.userId = options.userId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: options?.limit || 20,
      }),
      db.review.count({ where }),
    ]);

    return { reviews, total, page };
  } catch (error) {
    console.error("Get all reviews error:", error);
    return { reviews: [], total: 0, page: 1 };
  }
}

/**
 * Report a review
 * @param reviewId - Review ID
 * @param reason - Report reason
 * @returns Promise with success status
 */
export async function reportReview(
  reviewId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    // Mark review as reported
    await db.review.update({
      where: { id: reviewId },
      data: { comment: `[Reported]: ${reason}` },
    });

    // Optionally create a moderation task
    // This could be implemented later

    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("Report review error:", error);
    return { success: false, error: "রিভিউ জামা করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Helpful vote on a review
 * @param reviewId - Review ID
 * @param isHelpful - Whether the vote is helpful (true) or not (false)
 * @returns Promise with success status
 */
export async function voteOnReview(
  reviewId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Check if user already voted
    // This would need a separate HelpfulVote table
    // For now, we'll just return success

    return { success: true };
  } catch (error) {
    console.error("Vote on review error:", error);
    return { success: false, error: "রিভিউ জামা করতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Admin: Delete a review (any review, not just own)
 * @param reviewId - Review ID
 * @returns Promise with success status
 */
export async function adminDeleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    // Get review to get productId before deleting
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { productId: true },
    });

    if (!review) {
      return { success: false, error: "রিভিউ পাওয়া যায়নি" };
    }

    const productId = review.productId;

    // Delete review
    await db.review.delete({
      where: { id: reviewId },
    });

    // Update product rating and review count
    const remainingReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: remainingReviews.length,
      },
    });

    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("Admin delete review error:", error);
    return { success: false, error: "রিভিউ মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}

/**
 * Admin: Flag a review for moderation
 * @param reviewId - Review ID
 * @param flagged - Whether to flag or unflag
 * @returns Promise with success status
 */
export async function flagReview(
  reviewId: string,
  flagged: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    // For now, we'll just prepend [FLAGGED] to the comment
    // In a real implementation, you'd add a flagged field to the Review model
    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { comment: true },
    });

    if (!review) {
      return { success: false, error: "রিভিউ পাওয়া যায়নি" };
    }

    const isFlagged = review.comment?.startsWith("[FLAGGED] ") ?? false;
    const newComment = flagged
      ? !isFlagged
        ? `[FLAGGED] ${review.comment || ""}`
        : review.comment || ""
      : isFlagged
        ? review.comment?.replace("[FLAGGED] ", "") || ""
        : review.comment || "";

    await db.review.update({
      where: { id: reviewId },
      data: { comment: newComment || null },
    });

    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("Flag review error:", error);
    return { success: false, error: "রিভিউ ফ্ল্যাগ করতে ব্যর্থ হয়েছে" };
  }
}
