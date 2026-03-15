"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ==================== DELIVERY SETTINGS ACTIONS ====================

export interface DeliverySettingsData {
  division: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  freeDeliveryType: "FREE" | "PERCENTAGE";
  discountPercentage?: number;
  isActive?: boolean;
}

export interface DeliverySettingsResult {
  fee: number;
  isFree: boolean;
  discount: number;
  discountPercentage?: number;
}

// Get delivery settings for a specific division or default
export async function getDeliverySettings(division?: string) {
  try {
    let settings;

    if (division) {
      // Try to get division-specific settings
      settings = await db.deliverySettings.findUnique({
        where: { division, isActive: true },
      });
    }

    // Fallback to default (use first active settings or create default)
    if (!settings) {
      settings = await db.deliverySettings.findFirst({
        where: { isActive: true },
      });

      if (!settings) {
        // Return default values if no settings exist
        return {
          freeDeliveryThreshold: 500,
          standardDeliveryFee: 60,
          freeDeliveryType: "FREE" as const,
          discountPercentage: null,
        };
      }
    }

    return settings;
  } catch (error) {
    console.error("Get delivery settings error:", error);
    // Return default values on error
    return {
      freeDeliveryThreshold: 500,
      standardDeliveryFee: 60,
      freeDeliveryType: "FREE" as const,
      discountPercentage: null,
    };
  }
}

// Calculate delivery fee based on subtotal and division
export async function getDeliveryFee(subtotal: number, division?: string): Promise<DeliverySettingsResult> {
  const settings = await getDeliverySettings(division);

  if (subtotal >= settings.freeDeliveryThreshold) {
    if (settings.freeDeliveryType === "FREE") {
      return {
        fee: 0,
        isFree: true,
        discount: settings.standardDeliveryFee,
      };
    } else if (settings.freeDeliveryType === "PERCENTAGE" && settings.discountPercentage) {
      const discount = (settings.standardDeliveryFee * settings.discountPercentage) / 100;
      return {
        fee: settings.standardDeliveryFee - discount,
        isFree: false,
        discount,
        discountPercentage: settings.discountPercentage,
      };
    }
  }

  return {
    fee: settings.standardDeliveryFee,
    isFree: false,
    discount: 0,
  };
}

// Get all delivery settings (for admin)
export async function getAllDeliverySettings() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return [];
  }

  try {
    const settings = await db.deliverySettings.findMany({
      orderBy: { division: "asc" },
    });

    return settings;
  } catch (error) {
    console.error("Get all delivery settings error:", error);
    return [];
  }
}

// Update or create delivery settings (admin only)
export async function updateDeliverySettings(data: DeliverySettingsData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  // Validate inputs
  if (data.freeDeliveryThreshold <= 0) {
    return { success: false, error: "ফ্রি ডেলিভারি থ্রেশহোল্ড ০ এর বেশি হতে হবে" };
  }

  if (data.standardDeliveryFee < 0) {
    return { success: false, error: "ডেলিভারি ফি ০ বা তার বেশি হতে হবে" };
  }

  if (data.freeDeliveryType === "PERCENTAGE") {
    if (data.discountPercentage === undefined || data.discountPercentage < 0 || data.discountPercentage > 100) {
      return { success: false, error: "ছাড়ের হার ০-১০০% এর মধ্যে হতে হবে" };
    }
  }

  try {
    const existingSettings = await db.deliverySettings.findUnique({
      where: { division: data.division },
    });

    if (existingSettings) {
      // Update existing settings
      const updated = await db.deliverySettings.update({
        where: { division: data.division },
        data: {
          freeDeliveryThreshold: data.freeDeliveryThreshold,
          standardDeliveryFee: data.standardDeliveryFee,
          freeDeliveryType: data.freeDeliveryType,
          discountPercentage:
            data.freeDeliveryType === "PERCENTAGE"
              ? data.discountPercentage
              : null,
          isActive: data.isActive ?? true,
        },
      });

      revalidatePath("/admin/settings/delivery");
      return { success: true, settings: updated };
    } else {
      // Create new settings
      const created = await db.deliverySettings.create({
        data: {
          division: data.division,
          freeDeliveryThreshold: data.freeDeliveryThreshold,
          standardDeliveryFee: data.standardDeliveryFee,
          freeDeliveryType: data.freeDeliveryType,
          discountPercentage:
            data.freeDeliveryType === "PERCENTAGE"
              ? data.discountPercentage
              : null,
          isActive: data.isActive ?? true,
        },
      });

      revalidatePath("/admin/settings/delivery");
      return { success: true, settings: created };
    }
  } catch (error) {
    console.error("Update delivery settings error:", error);
    return { success: false, error: "ডেলিভারি সেটিংস আপডেট করা যায়নি" };
  }
}

// Delete delivery settings (admin only)
export async function deleteDeliverySettings(division: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    await db.deliverySettings.delete({
      where: { division },
    });

    revalidatePath("/admin/settings/delivery");
    return { success: true };
  } catch (error) {
    console.error("Delete delivery settings error:", error);
    return { success: false, error: "ডেলিভারি সেটিংস মুছে ফেলা যায়নি" };
  }
}

// Toggle delivery settings active status (admin only)
export async function toggleDeliverySettingsStatus(division: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  try {
    const settings = await db.deliverySettings.findUnique({
      where: { division },
      select: { isActive: true },
    });

    if (!settings) {
      return { success: false, error: "ডেলিভারি সেটিংস পাওয়া যায়নি" };
    }

    await db.deliverySettings.update({
      where: { division },
      data: { isActive: !settings.isActive },
    });

    revalidatePath("/admin/settings/delivery");
    return { success: true, isActive: !settings.isActive };
  } catch (error) {
    console.error("Toggle delivery settings status error:", error);
    return { success: false, error: "স্ট্যাটাস পরিবর্তন করা যায়নি" };
  }
}

// Initialize default delivery settings for all divisions
export async function initializeDefaultDeliverySettings() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই" };
  }

  const divisions = [
    "ঢাকা",
    "চট্টগ্রাম",
    "রাজশাহী",
    "খুলনা",
    "বরিশাল",
    "সিলেট",
    "রংপুর",
    "ময়মনসিংহ",
  ];

  try {
    const created = [];
    for (const division of divisions) {
      const existing = await db.deliverySettings.findUnique({
        where: { division },
      });

      if (!existing) {
        const settings = await db.deliverySettings.create({
          data: {
            division: division,
            freeDeliveryThreshold: 500,
            standardDeliveryFee: 60,
            freeDeliveryType: "FREE",
            isActive: true,
          },
        });
        created.push(settings);
      }
    }

    revalidatePath("/admin/settings/delivery");
    return {
      success: true,
      message: `${created.length} টি ডিফল্ট সেটিংস তৈরি হয়েছে`,
      created,
    };
  } catch (error) {
    console.error("Initialize default delivery settings error:", error);
    return { success: false, error: "ডিফল্ট সেটিংস তৈরি করা যায়নি" };
  }
}
