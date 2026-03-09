"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, ChevronRight, CreditCard, Banknote, Smartphone } from "lucide-react"
import { allProducts } from "@/lib/data"
import { cn } from "@/lib/utils"

// Mock cart items
const cartItems = [
  { ...allProducts[0], quantity: 2 },
  { ...allProducts[2], quantity: 1 },
]

const divisions = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
]

type Step = 1 | 2 | 3 | 4

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    division: "",
    area: "",
    address: "",
    instructions: "",
    paymentMethod: "cod",
  })

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 60
  const total = subtotal + deliveryFee

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = formData.fullName && formData.phone && formData.division && formData.address
  const isStep2Valid = formData.paymentMethod

  const handlePlaceOrder = () => {
    // Simulate order placement
    setStep(4)
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              অর্ডার সফল হয়েছে!
            </h1>
            <p className="text-muted-foreground mb-4">
              আপনার অর্ডার সফলভাবে প্লেস করা হয়েছে
            </p>
            <div className="bg-card rounded-lg p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-sm text-muted-foreground mb-2">অর্ডার নম্বর</p>
              <p className="text-2xl font-bold text-primary">#MB2024030912</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। আপনার ফোনে একটি কনফার্মেশন SMS পাঠানো হবে।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/account/orders">
                <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
                  অর্ডার ট্র্যাক করুন
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="border-primary text-primary">
                  শপিং চালিয়ে যান
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Section>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/cart" className="hover:text-primary">কার্ট</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">চেকআউট</span>
          </nav>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-16 md:w-24 h-1 mx-2",
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    ডেলিভারি তথ্য
                  </h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">পূর্ণ নাম *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="আপনার নাম"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">ফোন নম্বর *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="example@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="division">বিভাগ/সিটি *</Label>
                        <Select
                          value={formData.division}
                          onValueChange={(value) => handleInputChange("division", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map((div) => (
                              <SelectItem key={div} value={div}>
                                {div}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="area">এলাকা/থানা *</Label>
                        <Input
                          id="area"
                          value={formData.area}
                          onChange={(e) => handleInputChange("area", e.target.value)}
                          placeholder="এলাকার নাম"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="বাড়ি নং, রোড, এলাকা"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">ডেলিভারি নির্দেশনা (ঐচ্ছিক)</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => handleInputChange("instructions", e.target.value)}
                        placeholder="অতিরিক্ত কোনো নির্দেশনা"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full mt-6 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                  >
                    পরবর্তী ধাপ
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    পেমেন্ট পদ্ধতি
                  </h2>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    className="space-y-3"
                  >
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        formData.paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="cod" />
                      <Banknote className="h-6 w-6 text-success" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">ক্যাশ অন ডেলিভারি</p>
                        <p className="text-sm text-muted-foreground">
                          পণ্য হাতে পেয়ে পেমেন্ট করুন
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        formData.paymentMethod === "bkash"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="bkash" />
                      <Smartphone className="h-6 w-6 text-pink-500" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">বিকাশ</p>
                        <p className="text-sm text-muted-foreground">
                          বিকাশে পেমেন্ট করলে ৫% ক্যাশব্যাক
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        formData.paymentMethod === "nagad"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="nagad" />
                      <Smartphone className="h-6 w-6 text-orange-500" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">নগদ</p>
                        <p className="text-sm text-muted-foreground">
                          নগদে পেমেন্ট করলে ৫% ক্যাশব্যাক
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        formData.paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="card" />
                      <CreditCard className="h-6 w-6 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">ক্রেডিট/ডেবিট কার্ড</p>
                        <p className="text-sm text-muted-foreground">
                          Visa, Mastercard, AMEX
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      পেছনে যান
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!isStep2Valid}
                      className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                    >
                      পরবর্তী ধাপ
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    অর্ডার রিভিউ
                  </h2>
                  
                  {/* Delivery Info Summary */}
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">ডেলিভারি ঠিকানা</h3>
                    <p className="text-sm text-muted-foreground">{formData.fullName}</p>
                    <p className="text-sm text-muted-foreground">{formData.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.address}, {formData.area}, {formData.division}
                    </p>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">পেমেন্ট পদ্ধতি</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.paymentMethod === "cod" && "ক্যাশ অন ডেলিভারি"}
                      {formData.paymentMethod === "bkash" && "বিকাশ"}
                      {formData.paymentMethod === "nagad" && "নগদ"}
                      {formData.paymentMethod === "card" && "ক্রেডিট/ডেবিট কার্ড"}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-medium text-foreground">অর্ডার আইটেম</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 py-2 border-b border-border last:border-0">
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ৳{item.price.toLocaleString("bn-BD")} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-foreground">
                          ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1"
                    >
                      পেছনে যান
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                    >
                      অর্ডার কনফার্ম করুন
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-lg p-6 sticky top-24"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  অর্ডার সামারি
                </h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">সাবটোটাল</span>
                    <span className="text-foreground">৳{subtotal.toLocaleString("bn-BD")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডেলিভারি</span>
                    <span className="text-foreground">
                      {deliveryFee === 0 ? "ফ্রি" : `৳${deliveryFee.toLocaleString("bn-BD")}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold text-foreground">মোট</span>
                    <span className="text-xl font-bold text-primary">
                      ৳{total.toLocaleString("bn-BD")}
                    </span>
                  </div>
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
