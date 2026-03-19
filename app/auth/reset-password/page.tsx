"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { resetPassword, validateResetToken } from "@/lib/actions/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Get token from URL hash fragment for security (instead of query parameter)
  // This prevents the token from being exposed in browser history, logs, referrers
  const token = typeof window !== 'undefined'
    ? window.location.hash.replace('#', '')
    : searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsValid(false);
        setError("No reset token provided");
        setIsLoading(false);
        return;
      }

      const result = await validateResetToken(token);
      setIsValid(result.valid);
      setError(result.error || "");
      setIsLoading(false);
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsSubmitting(true);

    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else {
      setError(result.error || "Failed to reset password");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-lg p-8"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {isSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            পাসওয়ার্ড পরিবর্তন হয়েছে
          </h1>
          <p className="text-muted-foreground mb-6">
            আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।
          </p>
          <p className="text-sm text-muted-foreground">
            স্বয়ংক্রিয়ভাবে লগইন পেজে যাচ্ছে...
          </p>
        </div>
      ) : isValid ? (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              নতুন পাসওয়ার্ড দিন
            </h1>
            <p className="text-muted-foreground">
              আপনার একাউন্টের জন্য একটি শক্তিশালী পাসওয়ার্ড দিন।
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="নতুন পাসওয়ার্ড"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড আবার দিন"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  পরিবর্তন করা হচ্ছে...
                </>
              ) : (
                "পাসওয়ার্ড পরিবর্তন করুন"
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            লিংক আর কার্যকর নেই
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "এই পাসওয়ার্ড রিসেট লিংকটি আর কার্যকর নেই বা মেয়াদ উত্তীর্ণ হয়ে গেছে।"}
          </p>
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground">
              নতুন রিসেট লিংক চান
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-background">
      <NavbarClient user={session?.user} />

      <main>
        <Section className="py-16">
          <div className="max-w-md mx-auto">
            <Suspense
              fallback={
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-muted-foreground">লোড হচ্ছে...</p>
                </div>
              }
            >
              <ResetPasswordContent />
            </Suspense>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
