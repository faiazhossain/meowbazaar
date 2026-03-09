"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function login(
  email: string,
  password: string,
  redirectTo?: string
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড" };
        default:
          return {
            success: false,
            error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
          };
      }
    }
    return { success: false, error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" };
  }
}

export async function register(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<ActionResult> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "এই ইমেইল দিয়ে আগেই একাউন্ট খোলা হয়েছে",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Create empty cart for user
    await db.cart.create({
      data: {
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
