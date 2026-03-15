"use client";

import { useState, useEffect } from "react";
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
  User,
  ThumbsUp,
  Flag,
} from "lucide-react";
import { submitReview } from "@/lib/actions/reviews";
import { ProductCard, type Product } from "@/components/product/product-card";
import { Section, SectionHeader, ProductGrid } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useTranslation } from "@/lib/i18n/use-translation";
import { toast } from "sonner";

interface ProductData {
  id: string;
  name: string;
  nameEn?: string;
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
    nameEn: string;
    slug: string;
  };
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ProductDetailsClientProps {
  product: ProductData;
  relatedProducts: Product[];
  reviews: Review[];
  user: UserData | null;
}

export function ProductDetailsClient({
  product,
  relatedProducts,
  reviews: initialReviews,
  user,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { addItem } = useCart();
  const {
    isInWishlist,
    toggle: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  // Helper function to get localized product name
  const getLocalizedName = (name: string, nameEn?: string) => {
    return locale === "en" && nameEn ? nameEn : name;
  };

  // Helper function to format price based on locale
  const formatPrice = (price: number) => {
    if (locale === "en") {
      return `৳${price.toLocaleString("en-US")}`;
    }
    return `৳${price.toLocaleString("bn-BD")}`;
  };

  // Localized product and category names
  const localizedName = getLocalizedName(product.name, product.nameEn);
  const localizedCategoryName = getLocalizedName(
    product.category.name,
    product.category.nameEn
  );

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
      toast.error(t("product.loginToWishlist"));
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
        toast.success(t("product.addedToWishlist"));
      } else {
        toast.success(t("product.removedFromWishlist"));
      }
    } else {
      toast.error(result.error || t("product.error"));
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
        toast.success(`${product.name} ${t("product.addedToCart")}`);
      } else {
        toast.error(result.error || t("product.addToCartError"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(t("product.addToCartError"));
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
        toast.error(result.error || t("product.buyNowError"));
        setIsBuyingNow(false);
      }
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error(t("product.buyNowError"));
      setIsBuyingNow(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("লগইন করে রিভিউ দিন");
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(`/products/${product.id}`)
      );
      return;
    }

    if (rating === 0) {
      toast.error("রেটিং নির্বাচন করুন");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await submitReview({
        productId: product.id,
        rating,
        comment: comment || undefined,
      });

      if (result.success && result.review) {
        toast.success("রিভিউ সফলভাবে জমা দেওয়া হয়েছে");
        setReviews([result.review as Review, ...reviews]);
        setRating(0);
        setComment("");
        setShowReviewForm(false);
      } else {
        toast.error(result.error || "রিভিউ জমা দিতে ব্যর্থ হয়েছে");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error("রিভিউ জমা দিতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            {t("product.home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary">
            {t("product.products")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-primary"
          >
            {localizedCategoryName}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">
            {localizedName}
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
                    {t("product.new")}
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {discountPercentage}% {t("product.discount")}
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
                {localizedName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("product.category")}: {localizedCategoryName}
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
                {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                {t("product.ratingText")})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.mrp)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive"
                  >
                    {discountPercentage}% {t("product.save")}
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
                  ? `${t("product.inStock")} (${product.stock} ${t("product.available")})`
                  : t("product.outOfStock")}
              </span>
              {product.hasCOD && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                  {t("product.cashOnDelivery")}
                </span>
              )}
            </div>

            {/* Description Preview */}
            {product.description && (
              <div className="space-y-2 py-4 border-y border-border">
                <h3 className="font-medium text-foreground">
                  {t("product.descriptionTitle")}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">
                {t("product.quantity")}:
              </span>
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
                className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2 p-6 sm:p-2"
                size="lg"
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {t("product.addToCart")}
              </Button>
              <Button
                disabled={!product.inStock || isBuyingNow}
                variant="outline"
                className="flex-1 border-primary text-primary hover:text-orange-600 hover:bg-primary/5 gap-2 p-6 sm:p-2"
                size="lg"
                onClick={handleBuyNow}
              >
                {isBuyingNow ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : null}
                {t("product.buyNow")}
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
                <span className="text-xs font-medium">
                  {t("product.freeDelivery")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("product.freeDeliveryDesc")}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  {t("product.original")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("product.originalDesc")}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <RotateCcw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  {t("product.easyReturn")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("product.easyReturnDesc")}
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
              {t("product.description")}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              {t("product.reviews")} ({product.reviewCount})
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
                  {t("product.noDescription")}
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
                    {product.reviewCount} {t("product.ratingText")}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
                    const percentage = product.reviewCount > 0
                      ? Math.round((count / product.reviewCount) * 100)
                      : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-xs w-3">{stars}</span>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Form */}
              {user && (
                <div className="bg-card rounded-lg p-6">
                  {!showReviewForm ? (
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full"
                    >
                      {t("product.writeReview")}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t("product.yourRating")}
                        </label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseEnter={() => setHoveredRating(i + 1)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setRating(i + 1)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6",
                                  (hoveredRating || rating) > i
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium mb-2">
                          {t("product.yourComment")}
                        </label>
                        <textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="আপনার রিভিউ লিখুন..."
                          className="w-full min-h-[100px] p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.length}/1000
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || rating === 0}
                          className="flex-1"
                        >
                          {isSubmittingReview ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          {t("product.submitReview")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReviewForm(false);
                            setRating(0);
                            setComment("");
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("product.noReviews")}
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {review.userImage ? (
                            <Image
                              src={review.userImage}
                              alt={review.userName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("bn-BD", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {review.comment}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          সহায়ক
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          রিপোর্ট
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Section>
          <SectionHeader
            title={t("product.relatedProducts")}
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
