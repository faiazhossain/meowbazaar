"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

export async function getAllFAQs() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return [];
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return faqs;
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    return [];
  }
}

export async function getFAQById(id: string) {
  try {
    const faq = await prisma.fAQ.findUnique({
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

    const faq = await prisma.fAQ.create({
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

    const faq = await prisma.fAQ.update({
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

    await prisma.fAQ.delete({
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

    const faq = await prisma.fAQ.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!faq) {
      return { success: false, error: "FAQ not found" };
    }

    await prisma.fAQ.update({
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
