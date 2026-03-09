"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Star,
  Loader2,
  Share2,
  Bell,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CatLoader } from "@/components/ui/cat-loader";
import { cn } from "@/lib/utils";
import { getWishlist, removeFromWishlist } from "@/lib/actions/wishlist";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface WishlistProduct {
  id: string;
  name: string;
  nameEn: string | null;
  price: number;
  mrp: number | null;
  image: string;
  stock: number;
  inStock: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: Date;
  product: WishlistProduct;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();
  const { addItem, refreshCart } = useCart();
  const { remove: removeFromWishlistHook, refresh: refreshWishlist } =
    useWishlist();

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const items = await getWishlist();
        setWishlistItems(items as WishlistItem[]);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("উইশলিস্ট লোড করা যায়নি");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingIds((prev) => new Set(prev).add(productId));

    startTransition(async () => {
      const result = await removeFromWishlist(productId);

      if (result.success) {
        setWishlistItems((items) =>
          items.filter((item) => item.productId !== productId)
        );
        // Refresh the useWishlist hook so badge updates
        await refreshWishlist();
        toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }

      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    });
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const productId = item.productId;
    setAddingToCartIds((prev) => new Set(prev).add(productId));

    try {
      const result = await addItem(
        {
          id: item.product.id,
          name: item.product.name,
          nameEn: item.product.nameEn || undefined,
          price: item.product.price,
          mrp: item.product.mrp || undefined,
          image: item.product.image,
          stock: item.product.stock,
        },
        1
      );

      if (result.success) {
        // Remove from wishlist after successful cart add
        const removeResult = await removeFromWishlist(productId);
        if (removeResult.success) {
          setWishlistItems((items) =>
            items.filter((item) => item.productId !== productId)
          );
          // Refresh wishlist hook to update badge
          await refreshWishlist();
        }
        // Refresh cart to update badge
        await refreshCart();
        toast.success(
          `${item.product.name} কার্টে যোগ করা হয়েছে এবং উইশলিস্ট থেকে সরানো হয়েছে`
        );
      } else {
        toast.error(result.error || "কার্টে যোগ করা যায়নি");
      }
    } catch (error) {
      toast.error("কার্টে যোগ করা যায়নি");
    } finally {
      setAddingToCartIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleMoveAllToCart = async () => {
    const inStockItems = wishlistItems.filter(
      (item) => item.product.inStock && item.product.stock > 0
    );

    if (inStockItems.length === 0) {
      toast.error("কোন পণ্য স্টকে নেই");
      return;
    }

    let successCount = 0;

    for (const item of inStockItems) {
      try {
        const result = await addItem(
          {
            id: item.product.id,
            name: item.product.name,
            nameEn: item.product.nameEn || undefined,
            price: item.product.price,
            mrp: item.product.mrp || undefined,
            image: item.product.image,
            stock: item.product.stock,
          },
          1
        );

        if (result.success) {
          // Remove from wishlist
          await removeFromWishlist(item.productId);
          successCount++;
        }
      } catch (error) {
        // Continue with other items
      }
    }

    if (successCount > 0) {
      // Update local state
      setWishlistItems((items) =>
        items.filter(
          (item) => !inStockItems.some((i) => i.productId === item.productId)
        )
      );
      // Refresh badges
      await refreshCart();
      await refreshWishlist();
      toast.success(
        `${successCount}টি পণ্য কার্টে যোগ করা হয়েছে এবং উইশলিস্ট থেকে সরানো হয়েছে`
      );
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "আমার উইশলিস্ট - MeowBazaar",
        text: "MeowBazaar এ আমার পছন্দের পণ্যগুলো দেখুন",
        url: window.location.href,
      });
    } catch {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      toast.success("লিংক কপি করা হয়েছে");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <CatLoader text="উইশলিস্ট লোড হচ্ছে..." size="lg" />
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">আমার উইশলিস্ট</h1>
          <p className="text-muted-foreground">পছন্দের পণ্য সেভ করুন</p>
        </div>

        <div
          className="bg-card rounded-lg p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            আপনার উইশলিস্ট খালি
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            পণ্য ব্রাউজ করুন এবং হার্ট আইকনে ক্লিক করে পছন্দের পণ্য সেভ করুন।
            পরে কেনার জন্য সুবিধাজনক!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2">
                <ShoppingCart className="h-4 w-4" />
                শপিং শুরু করুন
              </Button>
            </Link>
            <Link href="/products?sort=popular">
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                জনপ্রিয় পণ্য দেখুন
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-10 pt-8 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-4">
              উইশলিস্ট ব্যবহারের সুবিধা
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    মূল্য পরিবর্তন
                  </p>
                  <p className="text-xs text-muted-foreground">
                    দাম কমলে নোটিফিকেশন পাবেন
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    দ্রুত কেনাকাটা
                  </p>
                  <p className="text-xs text-muted-foreground">
                    এক ক্লিকে কার্টে যোগ করুন
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Share2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">শেয়ার</p>
                  <p className="text-xs text-muted-foreground">
                    বন্ধুদের সাথে শেয়ার করুন
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Items list
  const inStockCount = wishlistItems.filter(
    (item) => item.product.inStock && item.product.stock > 0
  ).length;
  const outOfStockCount = wishlistItems.length - inStockCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">আমার উইশলিস্ট</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length}টি পণ্য সেভ করা আছে
            {outOfStockCount > 0 && (
              <span className="text-destructive">
                {" "}
                • {outOfStockCount}টি স্টকে নেই
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            শেয়ার
          </Button>
          {inStockCount > 0 && (
            <Button
              size="sm"
              onClick={handleMoveAllToCart}
              className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              সব কার্টে যোগ করুন ({inStockCount})
            </Button>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid gap-4">
        {wishlistItems.map((item) => {
          const product = item.product;
          const isRemoving = removingIds.has(item.productId);
          const isAddingToCart = addingToCartIds.has(item.productId);
          const discountPercentage = product.mrp
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;
          const isOutOfStock = !product.inStock || product.stock === 0;

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card rounded-lg p-4 transition-all duration-300",
                isRemoving && "opacity-50 scale-98",
                isOutOfStock && "opacity-75"
              )}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/products/${product.id}`}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted shrink-0 group"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        স্টক শেষ
                      </span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-1 left-1 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                        নতুন
                      </Badge>
                    )}
                    {discountPercentage > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
                        {discountPercentage}% ছাড়
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-medium text-foreground line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.category.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      disabled={isRemoving}
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">
                      ৳{product.price.toLocaleString("bn-BD")}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ৳{product.mrp.toLocaleString("bn-BD")}
                      </span>
                    )}
                  </div>

                  {/* Stock Status & Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {isOutOfStock ? (
                        <span className="text-xs text-destructive flex items-center gap-1">
                          <BellOff className="h-3 w-3" />
                          স্টক শেষ
                        </span>
                      ) : (
                        <span className="text-xs text-success">
                          ✓ স্টকে আছে ({product.stock}টি)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isOutOfStock ? "outline" : "default"}
                        disabled={isOutOfStock || isAddingToCart}
                        onClick={() => handleAddToCart(item)}
                        className={cn(
                          "gap-1.5",
                          !isOutOfStock &&
                            "bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                        )}
                      >
                        {isAddingToCart ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">কার্টে যোগ</span>
                      </Button>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <span className="hidden sm:inline">দেখুন</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Added Date - subtle */}
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    যোগ করা হয়েছে: {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Shopping */}
      <div className="text-center pt-4">
        <Link href="/products">
          <Button variant="outline" className="gap-2">
            আরও পণ্য দেখুন
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
