"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react"
import { allProducts } from "@/lib/data"

// Mock cart items
const initialCartItems = [
  { ...allProducts[0], quantity: 2 },
  { ...allProducts[2], quantity: 1 },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [couponCode, setCouponCode] = useState("")

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 60
  const total = subtotal + deliveryFee

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">আপনার কার্ট খালি</h1>
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartItems.length} />

      <main>
        <Section>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            শপিং কার্ট ({cartItems.length} পণ্য)
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-lg"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <Link href={`/products/${item.id}`} className="shrink-0">
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
                    <Link href={`/products/${item.id}`}>
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
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
                    <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                    <span className="font-medium text-foreground">
                      {deliveryFee === 0 ? (
                        <span className="text-success">ফ্রি</span>
                      ) : (
                        `৳${deliveryFee.toLocaleString("bn-BD")}`
                      )}
                    </span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-xs text-muted-foreground">
                      ৳{(500 - subtotal).toLocaleString("bn-BD")} আরও কিনলে ফ্রি ডেলিভারি!
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
                  <Link href="/checkout" className="block">
                    <Button className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2">
                      চেকআউট করুন
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/products" className="block">
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    ৭ দিনের রিটার্ন পলিসি
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  )
}
