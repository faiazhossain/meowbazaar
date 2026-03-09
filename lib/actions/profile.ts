"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

interface UpdateProfileData {
  name?: string;
  phone?: string;
  image?: string;
}

// Get current user profile
export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          wishlist: true,
          addresses: true,
        },
      },
    },
  });

  return user;
}

// Update profile
export async function updateProfile(data: UpdateProfileData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        image: data.image,
      },
    });

    revalidatePath("/account/profile");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "প্রোফাইল আপডেট করা যায়নি" };
  }
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { success: false, error: "ইউজার পাওয়া যায়নি" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "বর্তমান পাসওয়ার্ড ভুল" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "পাসওয়ার্ড পরিবর্তন করা যায়নি" };
  }
}
