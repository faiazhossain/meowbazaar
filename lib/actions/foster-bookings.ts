"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";

export interface CreateBookingData {
  fosterId: string;
  petInfo: {
    name: string;
    age: number;
    breed?: string;
    gender: string;
    type: "CAT" | "KITTEN";
    healthNotes?: string;
    specialNeeds?: string;
    feedingInstructions?: string;
  };
  checkIn: Date;
  checkOut: Date;
  numberOfCats: number;
  addOns?: { name: string; price: number }[];
  specialNeeds?: string;
  feedingInstructions?: string;
  emergencyContact: string;
  paymentMethod: string;
}

export async function createBooking(data: CreateBookingData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  // Get foster profile
  const foster = await db.fosterProfile.findUnique({
    where: { id: data.fosterId },
  });

  if (!foster || foster.status !== "APPROVED") {
    return { success: false, error: "ফস্টার হোম পাওয়া যায়নি / Foster home not found" };
  }

  // Calculate number of days
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return { success: false, error: "বুকিং কমপক্ষে ১ দিন হতে হবে / Booking must be at least 1 day" };
  }

  // Check availability
  const overlappingBookings = await db.booking.findMany({
    where: {
      fosterId: data.fosterId,
      status: {
        in: ["CONFIRMED", "IN_PROGRESS"],
      },
      OR: [
        {
          AND: [
            { checkIn: { lte: checkIn } },
            { checkOut: { gte: checkIn } },
          ],
        },
        {
          AND: [
            { checkIn: { lte: checkOut } },
            { checkOut: { gte: checkOut } },
          ],
        },
        {
          AND: [
            { checkIn: { gte: checkIn } },
            { checkOut: { lte: checkOut } },
          ],
        },
      ],
    },
  });

  const totalCatsBooked = overlappingBookings.reduce((sum, booking) => sum + booking.numberOfCats, 0);
  const availableCapacity = foster.maxCapacity - totalCatsBooked;

  if (availableCapacity < data.numberOfCats) {
    return {
      success: false,
      error: `প্রয়োজনীয় ক্ষমতা নেই। উপলব্ধ: ${availableCapacity} / Not enough capacity. Available: ${availableCapacity}`,
    };
  }

  // Calculate pricing
  let dailyRate = foster.basePricePerDay;
  if (data.petInfo.type === "KITTEN" && foster.kittenPricePerDay) {
    dailyRate = foster.kittenPricePerDay;
  }

  let basePrice = dailyRate * diffDays * data.numberOfCats;

  // Add weekend/holiday premium
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  let weekendDays = 0;
  let currentDate = new Date(checkIn);
  while (currentDate < checkOut) {
    if (isWeekend(currentDate)) {
      weekendDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (weekendDays > 0 && foster.weekendPremium > 0) {
    basePrice += foster.weekendPremium * weekendDays * data.numberOfCats;
  }

  // Add add-ons
  let addOnPrice = 0;
  if (data.addOns) {
    addOnPrice = data.addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  }

  const totalAmount = basePrice + addOnPrice;

  // Platform commission (20%)
  const commission = totalAmount * 0.2;
  const fosterPayout = totalAmount - commission;

  try {
    const booking = await db.booking.create({
      data: {
        bookingNumber: `FO${generateOrderNumber()}`,
        userId: session.user.id,
        fosterId: data.fosterId,
        petInfo: JSON.stringify(data.petInfo),
        checkIn,
        checkOut,
        numberOfCats: data.numberOfCats,
        basePrice,
        totalAmount,
        commission,
        fosterPayout,
        addOns: data.addOns ? JSON.stringify(data.addOns) : null,
        addOnPrice,
        specialNeeds: data.specialNeeds,
        feedingInstructions: data.feedingInstructions,
        emergencyContact: data.emergencyContact,
        paymentMethod: data.paymentMethod,
      },
    });

    // Create timeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: "PENDING",
        note: "বুকিং অনুরোধ জমা দেওয়া হয়েছে / Booking request submitted",
      },
    });

    // Create payment record
    await db.fosterPayment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        commission,
        netAmount: fosterPayout,
      },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/account/foster-bookings");

    return {
      success: true,
      data: booking,
      message: "বুকিং অনুরোধ সফলভাবে জমা দেওয়া হয়েছে / Booking request submitted successfully",
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: "বুকিং তৈরি করতে সমস্যা হয়েছে / Error creating booking",
    };
  }
}

export async function updateBookingStatus(bookingId: string, status: string, note?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      foster: true,
    },
  });

  if (!booking) {
    return { success: false, error: "বুকিং পাওয়া যায়নি / Booking not found" };
  }

  // Check permissions
  const isFosterOwner = booking.foster.userId === session.user.id;
  const isCustomer = booking.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isFosterOwner && !isCustomer && !isAdmin) {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Create timeline entry
    await db.bookingTimeline.create({
      data: {
        bookingId,
        status,
        note: note || `স্ট্যাটাস আপডেট: ${status} / Status updated: ${status}`,
      },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/account/foster-bookings");
    revalidatePath("/admin/foster-bookings");

    return {
      success: true,
      data: updatedBooking,
      message: "বুকিং স্ট্যাটাস আপডেট করা হয়েছে / Booking status updated",
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      error: "বুকিং স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে / Error updating booking status",
    };
  }
}

export async function getBookingById(bookingId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        foster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        timeline: {
          orderBy: {
            createdAt: "desc",
          },
        },
        payments: true,
        review: true,
      },
    });

    if (!booking) {
      return { success: false, error: "বুকিং পাওয়া যায়নি / Booking not found" };
    }

    // Check permissions
    const isFosterOwner = booking.foster.userId === session.user.id;
    const isCustomer = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isFosterOwner && !isCustomer && !isAdmin) {
      return { success: false, error: "অনুমতি নেই / Unauthorized" };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      error: "বুকিং লোড করতে সমস্যা হয়েছে / Error loading booking",
    };
  }
}

export async function getUserFosterBookings() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  try {
    const bookings = await db.booking.findMany({
      where: { userId: session.user.id },
      include: {
        foster: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return {
      success: false,
      error: "বুকিং লোড করতে সমস্যা হয়েছে / Error loading bookings",
    };
  }
}

export async function getFosterOwnerBookings() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const fosterProfile = await db.fosterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!fosterProfile) {
    return { success: false, error: "ফস্টার প্রোফাইল পাওয়া যায়নি / Foster profile not found" };
  }

  try {
    const bookings = await db.booking.findMany({
      where: { fosterId: fosterProfile.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Error fetching foster bookings:", error);
    return {
      success: false,
      error: "বুকিং লোড করতে সমস্যা হয়েছে / Error loading bookings",
    };
  }
}

export async function getBookingTimeline(bookingId: string) {
  try {
    const timeline = await db.bookingTimeline.findMany({
      where: { bookingId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: timeline };
  } catch (error) {
    console.error("Error fetching booking timeline:", error);
    return {
      success: false,
      error: "টাইমলাইন লোড করতে সমস্যা হয়েছে / Error loading timeline",
    };
  }
}

export async function addBookingUpdate(
  bookingId: string,
  status: string,
  note: string,
  photoUrl?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "অনুগ্রহ করে লগইন করুন / Please login" };
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { foster: true },
  });

  if (!booking) {
    return { success: false, error: "বুকিং পাওয়া যায়নি / Booking not found" };
  }

  if (booking.foster.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "অনুমতি নেই / Unauthorized" };
  }

  try {
    const timelineEntry = await db.bookingTimeline.create({
      data: {
        bookingId,
        status,
        note,
        photoUrl,
      },
    });

    revalidatePath("/foster/dashboard");
    revalidatePath("/account/foster-bookings");

    return {
      success: true,
      data: timelineEntry,
      message: "আপডেট সফলভাবে যোগ করা হয়েছে / Update added successfully",
    };
  } catch (error) {
    console.error("Error adding booking update:", error);
    return {
      success: false,
      error: "আপডেট যোগ করতে সমস্যা হয়েছে / Error adding update",
    };
  }
}
