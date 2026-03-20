"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";

export interface FosterRegistrationData {
  businessName: string;
  businessNameEn?: string;
  description: string;
  descriptionEn?: string;
  address: string;
  division: string;
  area: string;
  phone: string;
  altPhone?: string;
  email: string;
  website?: string;
  maxCapacity: number;
  currentOccupancy?: number;
  acceptsKittens: boolean;
  acceptsCats: boolean;
  services: string[];
  facilities: string[];
  basePricePerDay: number;
  kittenPricePerDay?: number;
  weekendPremium?: number;
  holidayPremium?: number;
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  availability?: string;
  bookingRules?: string;
}

export async function createFosterProfile(data: FosterRegistrationData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const existingProfile = await db.fosterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existingProfile) {
    return { success: false, error: "আপনার ইতিমধ্যে একটি ফস্টার প্রোফাইল রয়েছে / You already have a foster profile" };
  }

  try {
    const fosterProfile = await db.fosterProfile.create({
      data: {
        userId: session.user.id,
        businessName: data.businessName,
        businessNameEn: data.businessNameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        address: data.address,
        division: data.division,
        area: data.area,
        phone: data.phone,
        altPhone: data.altPhone,
        email: data.email,
        website: data.website,
        maxCapacity: data.maxCapacity,
        currentOccupancy: data.currentOccupancy || 0,
        acceptsKittens: data.acceptsKittens,
        acceptsCats: data.acceptsCats,
        services: JSON.stringify(data.services),
        facilities: JSON.stringify(data.facilities),
        basePricePerDay: data.basePricePerDay,
        kittenPricePerDay: data.kittenPricePerDay,
        weekendPremium: data.weekendPremium || 0,
        holidayPremium: data.holidayPremium || 0,
        coverImage: data.coverImage,
        galleryImages: data.galleryImages ? JSON.stringify(data.galleryImages) : null,
        videoUrl: data.videoUrl,
        availability: data.availability,
        bookingRules: data.bookingRules,
      },
    });

    // Update user role to FOSTER_OWNER
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "FOSTER_OWNER" },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/admin/foster");

    return {
      success: true,
      data: fosterProfile,
      message: "ফস্টার প্রোফাইল সফলভাবে তৈরি করা হয়েছে / Foster profile created successfully",
    };
  } catch (error) {
    console.error("Error creating foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল তৈরি করতে সমস্যা হয়েছে / Error creating foster profile",
    };
  }
}

export async function updateFosterProfile(id: string, data: Partial<FosterRegistrationData>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const profile = await db.fosterProfile.findUnique({
    where: { id },
  });

  if (!profile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  if (profile.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const updateData: any = {};

    if (data.businessName !== undefined) updateData.businessName = data.businessName;
    if (data.businessNameEn !== undefined) updateData.businessNameEn = data.businessNameEn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.division !== undefined) updateData.division = data.division;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.altPhone !== undefined) updateData.altPhone = data.altPhone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity;
    if (data.currentOccupancy !== undefined) updateData.currentOccupancy = data.currentOccupancy;
    if (data.acceptsKittens !== undefined) updateData.acceptsKittens = data.acceptsKittens;
    if (data.acceptsCats !== undefined) updateData.acceptsCats = data.acceptsCats;
    if (data.services !== undefined) updateData.services = JSON.stringify(data.services);
    if (data.facilities !== undefined) updateData.facilities = JSON.stringify(data.facilities);
    if (data.basePricePerDay !== undefined) updateData.basePricePerDay = data.basePricePerDay;
    if (data.kittenPricePerDay !== undefined) updateData.kittenPricePerDay = data.kittenPricePerDay;
    if (data.weekendPremium !== undefined) updateData.weekendPremium = data.weekendPremium;
    if (data.holidayPremium !== undefined) updateData.holidayPremium = data.holidayPremium;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.galleryImages !== undefined)
      updateData.galleryImages = data.galleryImages ? JSON.stringify(data.galleryImages) : null;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.availability !== undefined) updateData.availability = data.availability;
    if (data.bookingRules !== undefined) updateData.bookingRules = data.bookingRules;

    const updatedProfile = await db.fosterProfile.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/admin/foster");

    return {
      success: true,
      data: updatedProfile,
      message: "ফস্টার প্রোফাইল সফলভাবে আপডেট করা হয়েছে / Foster profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল আপডেট করতে সমস্যা হয়েছে / Error updating foster profile",
    };
  }
}

export async function getFosterProfile(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  try {
    const profile = await db.fosterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
    }

    if (profile.userId !== session.user.id && session.user.role !== "ADMIN" && profile.status !== "APPROVED") {
      return { success: false, error: "অনুমতি নেই / Unauthorized" };
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল লোড করতে সমস্যা হয়েছে / Error loading foster profile",
    };
  }
}

export async function getMyFosterProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  try {
    const profile = await db.fosterProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching my foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল লোড করতে সমস্যা হয়েছে / Error loading foster profile",
    };
  }
}

export async function uploadVerificationDocs(
  profileId: string,
  docs: { type: string; url: string }[]
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const profile = await db.fosterProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  if (profile.userId !== session.user.id) {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const updatedProfile = await db.fosterProfile.update({
      where: { id: profileId },
      data: {
        verificationDocs: JSON.stringify(docs),
      },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/admin/foster");

    return {
      success: true,
      data: updatedProfile,
      message: "যাচাইকরণ নথি সফলভাবে আপলোড করা হয়েছে / Verification docs uploaded successfully",
    };
  } catch (error) {
    console.error("Error uploading verification docs:", error);
    return {
      success: false,
      error: "যাচাইকরণ নথি আপলোড করতে সমস্যা হয়েছে / Error uploading verification docs",
    };
  }
}

export async function deleteFosterProfile(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const profile = await db.fosterProfile.findUnique({
    where: { id },
    include: {
      bookings: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
          },
        },
      },
    },
  });

  if (!profile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  if (profile.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  if (profile.bookings.length > 0) {
    return {
      success: false,
      error: "আপনার চলমান বুকিং রয়েছে। প্রথমে সেগুলি সম্পূর্ণ বা বাতিল করুন / You have active bookings. Please complete or cancel them first",
    };
  }

  try {
    await db.fosterProfile.delete({
      where: { id },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/admin/foster");

    return {
      success: true,
      message: "ফস্টার প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে / Foster profile deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল মুছে ফেলতে সমস্যা হয়েছে / Error deleting foster profile",
    };
  }
}
