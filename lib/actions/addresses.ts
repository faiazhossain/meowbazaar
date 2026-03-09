"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface AddressData {
  fullName: string;
  phone: string;
  division: string;
  area: string;
  address: string;
  instructions?: string;
  isDefault?: boolean;
}

// Get user's addresses
export async function getAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return addresses;
}

// Add new address
export async function addAddress(data: AddressData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // If this is set as default, remove default from others
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    // If this is first address, make it default
    const existingCount = await db.address.count({
      where: { userId: session.user.id },
    });

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        fullName: data.fullName,
        phone: data.phone,
        division: data.division,
        area: data.area,
        address: data.address,
        instructions: data.instructions,
        isDefault: data.isDefault || existingCount === 0,
      },
    });

    revalidatePath("/account/addresses");
    return { success: true, address };
  } catch (error) {
    console.error("Add address error:", error);
    return { success: false, error: "ঠিকানা যোগ করা যায়নি" };
  }
}

// Update address
export async function updateAddress(addressId: string, data: AddressData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // If this is set as default, remove default from others
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: { id: addressId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        division: data.division,
        area: data.area,
        address: data.address,
        instructions: data.instructions,
        isDefault: data.isDefault,
      },
    });

    revalidatePath("/account/addresses");
    return { success: true, address };
  } catch (error) {
    console.error("Update address error:", error);
    return { success: false, error: "ঠিকানা আপডেট করা যায়নি" };
  }
}

// Delete address
export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    const address = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!address) {
      return { success: false, error: "ঠিকানা পাওয়া যায়নি" };
    }

    await db.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, make another one default
    if (address.isDefault) {
      const firstAddress = await db.address.findFirst({
        where: { userId: session.user.id },
      });
      if (firstAddress) {
        await db.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    console.error("Delete address error:", error);
    return { success: false, error: "ঠিকানা মুছে ফেলা যায়নি" };
  }
}

// Set default address
export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "লগইন করুন" };
  }

  try {
    // Remove default from all
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });

    // Set this one as default
    await db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    console.error("Set default address error:", error);
    return { success: false, error: "ডিফল্ট ঠিকানা সেট করা যায়নি" };
  }
}

// Get default address
export async function getDefaultAddress() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const address = await db.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  return address;
}
