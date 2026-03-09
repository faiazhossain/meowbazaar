"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, X, ShoppingBag, ArrowRight, LogIn } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    isLoading,
    isPending,
    isAuthenticated,
    updateQuantity,
    removeItem,
    itemCount,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");

  const handleUpdateQuantity = (
    itemId: string,
    productId: string,
    newQuantity: number
  ) => {
    updateQuantity(itemId, productId, Math.max(1, newQuantity));
  };

  const handleRemoveItem = (itemId: string, productId: string) => {
    removeItem(itemId, productId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with callback to checkout
      router.push("/auth/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-card rounded-lg">
                  <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-32 mt-4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              আপনার কার্ট খালি
            </h1>
            <p className="text-muted-foreground mb-6">
              এখনো কোনো পণ্য কার্টে যোগ করা হয়নি
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
                শপিং চালিয়ে যান
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Section>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            শপিং কার্ট ({itemCount} পণ্য)
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-lg"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <Link
                    href={`/products/${item.productId}`}
                    className="shrink-0"
                  >
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-primary">
                        ৳{item.price.toLocaleString("bn-BD")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ৳{item.mrp.toLocaleString("bn-BD")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                          disabled={isPending || item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.id, item.productId)
                        }
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                        disabled={isPending}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-amber-600 mt-1">
                        সর্বোচ্চ স্টক সীমা
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-lg p-6 sticky top-24"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  অর্ডার সামারি
                </h2>

                {/* Guest User Notice */}
                {!isAuthenticated && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      চেকআউট করতে লগইন করুন। আপনার কার্ট সেভ থাকবে।
                    </p>
                  </div>
                )}

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="কুপন কোড"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" className="shrink-0">
                      প্রয়োগ
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">সাবটোটাল</span>
                    <span className="font-medium text-foreground">
                      ৳{subtotal.toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ডেলিভারি চার্জ
                    </span>
                    <span className="font-medium text-foreground">
                      {deliveryFee === 0 ? (
                        <span className="text-success">ফ্রি</span>
                      ) : (
                        `৳${deliveryFee.toLocaleString("bn-BD")}`
                      )}
                    </span>
                  </div>
                  {subtotal < 500 && subtotal > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ৳{(500 - subtotal).toLocaleString("bn-BD")} আরও কিনলে ফ্রি
                      ডেলিভারি!
                    </p>
                  )}
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">মোট</span>
                    <span className="text-xl font-bold text-primary">
                      ৳{total.toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
                    disabled={isPending}
                  >
                    {isAuthenticated ? (
                      <>
                        চেকআউট করুন
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        লগইন করে চেকআউট করুন
                      </>
                    )}
                  </Button>
                  <Link href="/products" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/5"
                    >
                      শপিং চালিয়ে যান
                    </Button>
                  </Link>
                </div>

                {/* Trust Messages */}
                <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    নিরাপদ পেমেন্ট
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    ক্যাশ অন ডেলিভারি সুবিধা
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />৭
                    দিনের রিটার্ন পলিসি
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
