"use server";

import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAllFosterProfiles(filters: {
  status?: string;
  division?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
} = {}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.division) {
      where.division = filters.division;
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    const [fosterProfiles, totalCount] = await Promise.all([
      prisma.fosterProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          bookings: {
            where: {
              status: {
                in: ["CONFIRMED", "IN_PROGRESS"],
              },
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.fosterProfile.count({ where }),
    ]);

    return {
      success: true,
      data: fosterProfiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching foster profiles:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল লোড করতে সমস্যা হয়েছে / Error loading foster profiles",
    };
  }
}

export async function getFosterProfileForAdmin(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const fosterProfile = await prisma.fosterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
          },
        },
        bookings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!fosterProfile) {
      return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
    }

    return { success: true, data: fosterProfile };
  } catch (error) {
    console.error("Error fetching foster profile:", error);
    return {
      success: false,
      error: "ফস্টার প্রোফাইল লোড করতে সমস্যা হয়েছে / Error loading foster profile",
    };
  }
}

export async function updateFosterStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED",
  note?: string
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  const fosterProfile = await prisma.fosterProfile.findUnique({
    where: { id },
  });

  if (!fosterProfile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  try {
    const updatedProfile = await prisma.fosterProfile.update({
      where: { id },
      data: {
        status,
        verified: status === "APPROVED" ? true : fosterProfile.verified,
      },
    });

    revalidatePath("/admin/foster");
    revalidatePath("/foster/dashboard");

    return {
      success: true,
      data: updatedProfile,
      message: `স্ট্যাটাস আপডেট করা হয়েছে: ${status} / Status updated: ${status}`,
    };
  } catch (error) {
    console.error("Error updating foster status:", error);
    return {
      success: false,
      error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে / Error updating status",
    };
  }
}

export async function toggleFosterVerification(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  const fosterProfile = await prisma.fosterProfile.findUnique({
    where: { id },
  });

  if (!fosterProfile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  try {
    const updatedProfile = await prisma.fosterProfile.update({
      where: { id },
      data: {
        verified: !fosterProfile.verified,
      },
    });

    revalidatePath("/admin/foster");
    revalidatePath("/foster");

    return {
      success: true,
      data: updatedProfile,
      message: `যাচাইকরণ ${!fosterProfile.verified ? "সক্ষম" : "অক্ষম"} করা হয়েছে / Verification ${!fosterProfile.verified ? "enabled" : "disabled"}`,
    };
  } catch (error) {
    console.error("Error toggling verification:", error);
    return {
      success: false,
      error: "যাচাইকরণ আপডেট করতে সমস্যা হয়েছে / Error updating verification",
    };
  }
}

export async function deleteFosterProfile(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  const fosterProfile = await prisma.fosterProfile.findUnique({
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

  if (!fosterProfile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  if (fosterProfile.bookings && fosterProfile.bookings.length > 0) {
    return {
      success: false,
      error: "চলমান বুকিং রয়েছে। প্রথমে সেগুলি সম্পূর্ণ বা বাতিল করুন / There are active bookings. Please complete or cancel them first",
    };
  }

  try {
    await prisma.fosterProfile.delete({
      where: { id },
    });

    revalidatePath("/admin/foster");
    revalidatePath("/foster");

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

export async function getFosterStats() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const [total, pending, approved, rejected, suspended, verified] = await Promise.all([
      prisma.fosterProfile.count(),
      prisma.fosterProfile.count({ where: { status: "PENDING" } }),
      prisma.fosterProfile.count({ where: { status: "APPROVED" } }),
      prisma.fosterProfile.count({ where: { status: "REJECTED" } }),
      prisma.fosterProfile.count({ where: { status: "SUSPENDED" } }),
      prisma.fosterProfile.count({ where: { verified: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        suspended,
        verified,
      },
    };
  } catch (error) {
    console.error("Error fetching foster stats:", error);
    return {
      success: false,
      error: "পরিসংখ্যান লোড করতে সমস্যা হয়েছে / Error loading stats",
    };
  }
}
