"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { Section, SectionHeader, ProductGrid } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronRight, 
  Minus, 
  Plus, 
  Heart, 
  ShoppingCart, 
  Star,
  Truck,
  Shield,
  RotateCcw,
  Share2
} from "lucide-react"
import { allProducts } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = params.id as string
  
  const product = allProducts.find((p) => p.id === productId) || allProducts[0]
  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Mock multiple images
  const productImages = [
    product.image,
    product.image.replace("?w=400", "?w=401"),
    product.image.replace("?w=400", "?w=402"),
  ]

  const discountPercentage = product.mrp 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : product.discount

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={2} wishlistCount={3} />

      <main>
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">হোম</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-primary">পণ্য</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <Section className="pt-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-primary text-primary-foreground">নতুন</Badge>
                  )}
                  {discountPercentage && discountPercentage > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground">{discountPercentage}% ছাড়</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-3">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === index ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                {product.nameEn && (
                  <p className="text-muted-foreground">{product.nameEn}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {product.rating} ({product.reviewCount} রিভিউ)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ৳{product.price.toLocaleString("bn-BD")}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ৳{product.mrp.toLocaleString("bn-BD")}
                    </span>
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                      {discountPercentage}% সেভ করুন
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    product.inStock
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {product.inStock ? "স্টকে আছে" : "স্টক শেষ"}
                </span>
                {product.hasCOD && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                    ক্যাশ অন ডেলিভারি
                  </span>
                )}
              </div>

              {/* Key Features */}
              <div className="space-y-2 py-4 border-y border-border">
                <h3 className="font-medium text-foreground">মূল বৈশিষ্ট্য:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>- প্রিমিয়াম কোয়ালিটি</li>
                  <li>- ১০০% অরিজিনাল প্রোডাক্ট</li>
                  <li>- বিড়ালের স্বাস্থ্যের জন্য উপযোগী</li>
                </ul>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">পরিমাণ:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  disabled={!product.inStock}
                  className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  কার্টে যোগ করুন
                </Button>
                <Button
                  disabled={!product.inStock}
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary/5 gap-2"
                  size="lg"
                >
                  এখনই কিনুন
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "px-4",
                    isWishlisted && "border-destructive text-destructive"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive")} />
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                  <Truck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">ফ্রি ডেলিভারি</span>
                  <span className="text-xs text-muted-foreground">৫০০+ অর্ডারে</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">১০০% অরিজিনাল</span>
                  <span className="text-xs text-muted-foreground">গ্যারান্টিড</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                  <RotateCcw className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">সহজ রিটার্ন</span>
                  <span className="text-xs text-muted-foreground">৭ দিনের মধ্যে</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Product Details Tabs */}
        <Section className="bg-muted/50">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
              >
                বিবরণ
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
              >
                স্পেসিফিকেশন
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
              >
                রিভিউ ({product.reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-0">
              <div className="prose max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed">
                  এই প্রোডাক্টটি আপনার বিড়ালের জন্য বিশেষভাবে তৈরি করা হয়েছে। উচ্চমানের উপাদান ব্যবহার করে তৈরি এই পণ্যটি আপনার পোষা প্রাণীর স্বাস্থ্য ও সুখের জন্য আদর্শ।
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  আমাদের সকল পণ্য ১০০% অরিজিনাল এবং সরাসরি ব্র্যান্ড থেকে সংগ্রহ করা। আপনার বিড়ালের যত্নে সেরা পণ্য নির্বাচন করুন।
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-0">
              <div className="bg-card rounded-lg p-6">
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 text-muted-foreground">ব্র্যান্ড</td>
                      <td className="py-3 font-medium text-foreground">Royal Canin</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">ওজন</td>
                      <td className="py-3 font-medium text-foreground">2 কেজি</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">উৎপাদনের দেশ</td>
                      <td className="py-3 font-medium text-foreground">ফ্রান্স</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-muted-foreground">বয়স</td>
                      <td className="py-3 font-medium text-foreground">প্রাপ্তবয়স্ক (১+ বছর)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-4 p-6 bg-card rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{product.rating}</div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.reviewCount} রিভিউ
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-4 bg-card rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < 4 + (index % 2)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">- মোঃ আব্দুল্লাহ</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        খুব ভালো প্রোডাক্ট। আমার বিড়াল এটা খুব পছন্দ করেছে। ডেলিভারিও দ্রুত ছিল।
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Section>
            <SectionHeader 
              title="সম্পর্কিত পণ্য" 
              href={`/products?category=${product.category}`}
            />
            <ProductGrid>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  )
}
