"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface FosterFilters {
  division?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  acceptsKittens?: boolean;
  services?: string[];
  minRating?: number;
  verified?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getFosterHomes(filters: FosterFilters = {}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      status: filters.status || "APPROVED",
    };

    if (filters.division) {
      where.division = filters.division;
    }

    if (filters.area) {
      where.area = {
        contains: filters.area,
        mode: "insensitive",
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.basePricePerDay = {};
      if (filters.minPrice) {
        where.basePricePerDay.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.basePricePerDay.lte = filters.maxPrice;
      }
    }

    if (filters.acceptsKittens !== undefined) {
      where.acceptsKittens = filters.acceptsKittens;
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters.minRating) {
      where.rating = {
        gte: filters.minRating,
      };
    }

    const [fosterHomes, totalCount] = await Promise.all([
      prisma.fosterProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { rating: "desc" },
          { reviewCount: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.fosterProfile.count({ where }),
    ]);

    return {
      success: true,
      data: fosterHomes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching foster homes:", error);
    return {
      success: false,
      error: "ফস্টার হোম লোড করতে সমস্যা হয়েছে / Error loading foster homes",
    };
  }
}

export async function getFosterHomeById(id: string) {
  try {
    const fosterHome = await prisma.fosterProfile.findUnique({
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
        reviews: {
          include: {
            user: {
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
          take: 10,
        },
      },
    });

    if (!fosterHome) {
      return {
        success: false,
        error: "ফস্টার হোম পাওয়া যায়নি / Foster home not found",
      };
    }

    // Parse JSON fields
    const parsedFosterHome = {
      ...fosterHome,
      services: fosterHome.services ? JSON.parse(fosterHome.services) : [],
      facilities: fosterHome.facilities ? JSON.parse(fosterHome.facilities) : [],
      galleryImages: fosterHome.galleryImages ? JSON.parse(fosterHome.galleryImages) : [],
      verificationDocs: fosterHome.verificationDocs ? JSON.parse(fosterHome.verificationDocs) : [],
    };

    return { success: true, data: parsedFosterHome };
  } catch (error) {
    console.error("Error fetching foster home:", error);
    return {
      success: false,
      error: "ফস্টার হোম লোড করতে সমস্যা হয়েছে / Error loading foster home",
    };
  }
}

export async function getFeaturedFosterHomes(limit: number = 6) {
  try {
    const fosterHomes = await prisma.fosterProfile.findMany({
      where: {
        status: "APPROVED",
        rating: {
          gte: 4.0,
        },
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { reviewCount: "desc" },
      ],
    });

    return { success: true, data: fosterHomes };
  } catch (error) {
    console.error("Error fetching featured foster homes:", error);
    return {
      success: false,
      error: "ফিচার্ড ফস্টার হোম লোড করতে সমস্যা হয়েছে / Error loading featured foster homes",
    };
  }
}

export async function getFosterDivisions() {
  try {
    const divisions = await prisma.fosterProfile.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        division: true,
      },
      distinct: ["division"],
    });

    return { success: true, data: divisions };
  } catch (error) {
    console.error("Error fetching foster divisions:", error);
    return {
      success: false,
      error: "বিভাগ লোড করতে সমস্যা হয়েছে / Error loading divisions",
    };
  }
}

export async function getFosterAvailability(
  fosterId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        fosterId,
        status: {
          in: ["CONFIRMED", "IN_PROGRESS"],
        },
        OR: [
          {
            AND: [
              { checkIn: { lte: startDate } },
              { checkOut: { gte: startDate } },
            ],
          },
          {
            AND: [
              { checkIn: { lte: endDate } },
              { checkOut: { gte: endDate } },
            ],
          },
          {
            AND: [
              { checkIn: { gte: startDate } },
              { checkOut: { lte: endDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        numberOfCats: true,
      },
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Error fetching foster availability:", error);
    return {
      success: false,
      error: "প্রাপ্যতা লোড করতে সমস্যা হয়েছে / Error loading availability",
    };
  }
}
