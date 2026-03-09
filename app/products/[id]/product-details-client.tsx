"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Share2,
  Loader2,
} from "lucide-react";
import { ProductCard, type Product } from "@/components/product/product-card";
import { Section, SectionHeader, ProductGrid } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  image: string;
  images: string | null;
  stock: number;
  inStock: boolean;
  isNew: boolean;
  hasCOD: boolean;
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductDetailsClientProps {
  product: ProductData;
  relatedProducts: Product[];
}

export function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const { addItem } = useCart();
  const {
    isInWishlist,
    toggle: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  // Parse additional images
  const additionalImages: string[] = product.images
    ? JSON.parse(product.images)
    : [];
  const productImages = [product.image, ...additionalImages];

  const discountPercentage = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("উইশলিস্টে যোগ করতে লগইন করুন");
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(`/products/${product.id}`)
      );
      return;
    }

    setIsTogglingWishlist(true);
    const result = await toggleWishlist(product.id);

    if (result.success) {
      if (result.action === "added") {
        toast.success("উইশলিস্টে যোগ করা হয়েছে");
      } else {
        toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
      }
    } else {
      toast.error(result.error || "সমস্যা হয়েছে");
    }

    setIsTogglingWishlist(false);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const result = await addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        quantity
      );
      if (result.success) {
        toast.success(`${product.name} কার্টে যোগ করা হয়েছে`);
      } else {
        toast.error(result.error || "কার্টে যোগ করতে সমস্যা হয়েছে");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("কার্টে যোগ করতে সমস্যা হয়েছে");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      const result = await addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
        quantity
      );
      if (result.success) {
        router.push("/checkout");
      } else {
        toast.error(result.error || "সমস্যা হয়েছে, আবার চেষ্টা করুন");
        setIsBuyingNow(false);
      }
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন");
      setIsBuyingNow(false);
    }
  };

  return (
    <main>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            হোম
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary">
            পণ্য
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-primary"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">
            {product.name}
          </span>
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
                  <Badge className="bg-primary text-primary-foreground">
                    নতুন
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {discountPercentage}% ছাড়
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-3">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
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
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                ক্যাটাগরি: {product.category.name}
              </p>
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
                {product.rating.toFixed(1)} ({product.reviewCount} রিভিউ)
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
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive"
                  >
                    {discountPercentage}% সেভ করুন
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  product.inStock
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {product.inStock
                  ? `স্টকে আছে (${product.stock} টি)`
                  : "স্টক শেষ"}
              </span>
              {product.hasCOD && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                  ক্যাশ অন ডেলিভারি
                </span>
              )}
            </div>

            {/* Description Preview */}
            {product.description && (
              <div className="space-y-2 py-4 border-y border-border">
                <h3 className="font-medium text-foreground">বিবরণ:</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}

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
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
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
                disabled={!product.inStock || isAddingToCart}
                className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
                size="lg"
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                কার্টে যোগ করুন
              </Button>
              <Button
                disabled={!product.inStock || isBuyingNow}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5 gap-2"
                size="lg"
                onClick={handleBuyNow}
              >
                {isBuyingNow ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : null}
                এখনই কিনুন
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
                className={cn(
                  "px-4",
                  isWishlisted && "border-destructive text-destructive"
                )}
              >
                {isTogglingWishlist ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isWishlisted && "fill-destructive"
                    )}
                  />
                )}
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
                <span className="text-xs text-muted-foreground">
                  ৫০০+ অর্ডারে
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">১০০% অরিজিনাল</span>
                <span className="text-xs text-muted-foreground">
                  গ্যারান্টিড
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <RotateCcw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">সহজ রিটার্ন</span>
                <span className="text-xs text-muted-foreground">
                  ৭ দিনের মধ্যে
                </span>
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
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              রিভিউ ({product.reviewCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-0">
            <div className="prose max-w-none text-foreground bg-card rounded-lg p-6">
              {product.description ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  এই পণ্যের কোন বিবরণ নেই।
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-0">
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="flex items-center gap-4 p-6 bg-card rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {product.rating.toFixed(1)}
                  </div>
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

              {product.reviewCount === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  এই পণ্যে এখনো কোন রিভিউ নেই।
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  রিভিউ লোড হচ্ছে...
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Section>
          <SectionHeader
            title="সম্পর্কিত পণ্য"
            href={`/products?category=${product.category.slug}`}
          />
          <ProductGrid>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </Section>
      )}
    </main>
  );
}
