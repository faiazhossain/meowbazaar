"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || "Something went wrong");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Section className="py-16">
          <div className="max-w-md mx-auto">
            <div
              className="bg-card rounded-lg p-8"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {isSubmitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    ইমেইল পাঠানো হয়েছে
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    পাসওয়ার্ড রিসেট করার লিংক সহ একটি ইমেইল পাঠানো হয়েছে{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    -এ। ইমেইল চেক করুন।
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন অথবা আবার চেষ্টা করুন।
                  </p>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      লগইন পেজে ফিরে যান
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </h1>
                    <p className="text-muted-foreground">
                      আপনার ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠাবো।
                    </p>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">ইমেইল</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="আপনার ইমেইল"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        "রিসেট লিংক পাঠান"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      লগইন পেজে ফিরে যান
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
