"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatLoader } from "@/components/ui/cat-loader";
import { Minus, Plus, X, ShoppingBag, ArrowRight, LogIn } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { calculateDeliveryFee, formatDeliveryMessage } from "@/lib/utils/delivery";
import type { DeliveryFeeResult } from "@/lib/utils/delivery";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
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

  // Use both the hook's isAuthenticated and session status for reliability
  const isUserAuthenticated =
    isAuthenticated || sessionStatus === "authenticated";
  const isSessionLoading = sessionStatus === "loading";

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
    if (!isUserAuthenticated) {
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
  const [deliveryResult, setDeliveryResult] = useState<DeliveryFeeResult | null>(null);

  // Calculate delivery fee based on settings
  useEffect(() => {
    const calculateDelivery = async () => {
      const result = await calculateDeliveryFee(subtotal);
      setDeliveryResult(result);
    };
    calculateDelivery();
  }, [subtotal]);

  const deliveryFee = deliveryResult?.fee || 0;
  const total = subtotal + deliveryFee;

  // Loading state - wait for both cart and session to load
  if (isLoading || isSessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarClient user={session?.user} />
        <main className="min-h-[60vh] flex items-center justify-center">
          <CatLoader text="কার্ট লোড হচ্ছে..." size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarClient user={session?.user} />
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
      <NavbarClient user={session?.user} />

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
                          className="p-3 md:p-2 hover:bg-muted transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                          disabled={isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-medium min-w-[40px] text-center">
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
                          className="p-3 md:p-2 hover:bg-muted transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                        className="p-3 md:p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
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

            {/* Order Summary - Full width on mobile, sticky sidebar on desktop */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-lg p-4 sm:p-6 lg:sticky lg:top-24"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  অর্ডার সামারি
                </h2>

                {/* Guest User Notice */}
                {!isUserAuthenticated && (
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
                      {deliveryResult ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: deliveryResult.fee === 0
                              ? '<span class="text-success">ফ্রি</span>'
                              : `৳${deliveryFee.toLocaleString("bn-BD")}`,
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">লোড হচ্ছে...</span>
                      )}
                    </span>
                  </div>
                  {deliveryResult && !deliveryResult.thresholdReached && deliveryResult.amountToFree && (
                    <p className="text-xs text-muted-foreground">
                      {formatDeliveryMessage(deliveryResult, "bn")}
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
                    {isUserAuthenticated ? (
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
