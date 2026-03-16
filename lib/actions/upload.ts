"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadProfilePicture(formData: FormData): Promise<UploadResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPG, PNG, or WebP image.",
      };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File is too large. Maximum size is 2MB.",
      };
    }

    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      // Fallback: just store a placeholder URL for development
      const placeholderUrl = "/placeholder-avatar.png";
      await db.user.update({
        where: { id: session.user.id },
        data: { image: placeholderUrl },
      });
      revalidatePath("/account/profile");
      return { success: true, url: placeholderUrl };
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    cloudinaryFormData.append("folder", "petbazaar/avatars");
    cloudinaryFormData.append("public_id", `avatar_${session.user.id}_${Date.now()}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      return { success: false, error: "Failed to upload image" };
      }

    const data = await response.json();
    const imageUrl = data.secure_url as string;

    // Update user's image in database
    await db.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/account/profile");
    return { success: true, url: imageUrl };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function removeProfilePicture(): Promise<UploadResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    revalidatePath("/account/profile");
    return { success: true };
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return { success: false, error: "Failed to remove image" };
  }
}
