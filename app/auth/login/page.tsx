"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setError(result.error || "লগইন ব্যর্থ হয়েছে");
    }

    setIsLoading(false);
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main>
        <Section className='py-16'>
          <div className='max-w-md mx-auto'>
            <div
              className='bg-card rounded-lg p-8'
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className='text-center mb-8'>
                <h1 className='text-2xl font-bold text-foreground mb-2'>
                  লগইন করুন
                </h1>
                <p className='text-muted-foreground'>PetBazaar এ স্বাগতম</p>
              </div>

              {error && (
                <div className='bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6'>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>ইমেইল</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='আপনার ইমেইল'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='password'>পাসওয়ার্ড</Label>
                    <Link
                      href='/auth/forgot-password'
                      className='text-sm text-primary hover:text-brand-orange-dark'
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? "text" : "password"}
                      placeholder='আপনার পাসওয়ার্ড'
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      লগইন হচ্ছে...
                    </>
                  ) : (
                    "লগইন করুন"
                  )}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-muted-foreground'>
                  একাউন্ট নেই?{" "}
                  <Link
                    href='/auth/register'
                    className='text-primary hover:text-brand-orange-dark font-medium'
                  >
                    রেজিস্টার করুন
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
