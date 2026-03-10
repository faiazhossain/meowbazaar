"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { randomBytes } from "crypto";
import { recordLoginAttempt, recordRegistration } from "./analytics";
import { sendPasswordResetEmail } from "@/lib/email";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function login(
  email: string,
  password: string,
  redirectTo?: string
): Promise<ActionResult> {
  // First check if user exists to get userId for tracking
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Record successful login
    await recordLoginAttempt(email, true, user?.id);

    return { success: true };
  } catch (error) {
    let failReason = "Unknown error";

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          failReason = "Invalid credentials";
          // Record failed login
          await recordLoginAttempt(email, false, user?.id, failReason);
          return { success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড" };
        default:
          failReason = error.type;
          await recordLoginAttempt(email, false, user?.id, failReason);
          return {
            success: false,
            error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
          };
      }
    }

    await recordLoginAttempt(email, false, user?.id, failReason);
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

    // Record registration for analytics
    await recordRegistration(user.id, email);

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

export async function forgotPassword(email: string): Promise<ActionResult> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Delete any existing reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate new token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      email,
      resetLink,
    });

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return success to prevent email enumeration
    return { success: true };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    if (resetToken.expires < new Date()) {
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return { success: false, error: "Token has expired" };
    }

    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function validateResetToken(
  token: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: "Invalid token" };
    }

    if (resetToken.expires < new Date()) {
      return { valid: false, error: "Token has expired" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Failed to validate token" };
  }
}
