"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData) {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return {
        success: false,
        error: "Please fill in all required fields",
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    // Create contact message
    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        status: "NEW",
      },
    });

    revalidatePath("/admin/contact");

    return {
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon!",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}

export async function getContactMessages(status?: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return [];
    }

    const where = status ? { status } : {};

    const messages = await db.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }
}

export async function getContactMessageById(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return null;
    }

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    return message;
  } catch (error) {
    console.error("Error fetching contact message:", error);
    return null;
  }
}

export async function updateContactMessageStatus(id: string, status: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.contactMessage.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (error) {
    console.error("Error updating contact message status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteContactMessage(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.contactMessage.delete({
      where: { id },
    });

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

export async function getContactStats() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return null;
    }

    const [total, newMessages, read, resolved] = await Promise.all([
      db.contactMessage.count(),
      db.contactMessage.count({ where: { status: "NEW" } }),
      db.contactMessage.count({ where: { status: "READ" } }),
      db.contactMessage.count({ where: { status: "RESOLVED" } }),
    ]);

    return { total, newMessages, read, resolved };
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return null;
  }
}
