"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface FAQData {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export async function getActiveFAQs() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

export async function getAllFAQs(options?: {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { faqs: [], total: 0 };
    }

    const page = options?.page || 1;
    const skip = (page - 1) * (options?.limit || 20);

    const where: any = {};
    if (options?.category) {
      where.category = options.category;
    }
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [faqs, total] = await Promise.all([
      db.fAQ.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: options?.limit || 20,
      }),
      db.fAQ.count({ where }),
    ]);

    return { faqs, total };
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    return { faqs: [], total: 0 };
  }
}

export async function getFAQById(id: string) {
  try {
    const faq = await db.fAQ.findUnique({
      where: { id },
    });

    return faq;
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return null;
  }
}

export async function createFAQ(data: FAQData) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const faq = await db.fAQ.create({
      data: {
        question: data.question,
        questionEn: data.questionEn,
        answer: data.answer,
        answerEn: data.answerEn,
        category: data.category || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");

    return { success: true, faq };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return { success: false, error: "Failed to create FAQ" };
  }
}

export async function updateFAQ(id: string, data: Partial<FAQData>) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const faq = await db.fAQ.update({
      where: { id },
      data: {
        question: data.question,
        questionEn: data.questionEn,
        answer: data.answer,
        answerEn: data.answerEn,
        category: data.category,
        order: data.order,
        isActive: data.isActive,
      },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");

    return { success: true, faq };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return { success: false, error: "Failed to update FAQ" };
  }
}

export async function deleteFAQ(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.fAQ.delete({
      where: { id },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");

    return { success: true };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return { success: false, error: "Failed to delete FAQ" };
  }
}

export async function toggleFAQStatus(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const faq = await db.fAQ.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!faq) {
      return { success: false, error: "FAQ not found" };
    }

    await db.fAQ.update({
      where: { id },
      data: { isActive: !faq.isActive },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");

    return { success: true };
  } catch (error) {
    console.error("Error toggling FAQ status:", error);
    return { success: false, error: "Failed to toggle FAQ status" };
  }
}

export async function getFAQCategories() {
  try {
    const categories = await db.fAQ.findMany({
      where: { isActive: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });

    return categories.map((f) => f.category).filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching FAQ categories:", error);
    return [];
  }
}
