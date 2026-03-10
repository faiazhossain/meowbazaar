"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      setIsLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
    );

    if (result.success) {
      // Hard redirect to login page
      window.location.href = "/auth/login?registered=true";
    } else {
      setError(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
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
                  নতুন একাউন্ট খুলুন
                </h1>
                <p className='text-muted-foreground'>PetBazaar এ যোগ দিন</p>
              </div>

              {error && (
                <div className='bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6'>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>নাম *</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='আপনার পূর্ণ নাম'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>ইমেইল *</Label>
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
                  <Label htmlFor='phone'>ফোন নম্বর *</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='০১XXXXXXXXX'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>পাসওয়ার্ড *</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? "text" : "password"}
                      placeholder='কমপক্ষে ৬ অক্ষর'
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

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>
                    পাসওয়ার্ড নিশ্চিত করুন *
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    placeholder='পাসওয়ার্ড আবার লিখুন'
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      রেজিস্টার হচ্ছে...
                    </>
                  ) : (
                    "রেজিস্টার করুন"
                  )}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-muted-foreground'>
                  ইতিমধ্যে একাউন্ট আছে?{" "}
                  <Link
                    href='/auth/login'
                    className='text-primary hover:text-brand-orange-dark font-medium'
                  >
                    লগইন করুন
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
