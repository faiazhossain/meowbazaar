"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  mrp?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
  hasCOD?: boolean;
  category: string;
  petType?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductCard({ product, onAddToWishlist }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addItem } = useCart();
  const {
    isInWishlist,
    toggle: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("উইশলিস্টে যোগ করতে লগইন করুন");
      return;
    }

    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);

    const result = await toggleWishlist(product.id);

    if (result.success) {
      if (result.action === "added") {
        toast.success(`${product.name} উইশলিস্টে যোগ করা হয়েছে`);
      } else {
        toast.success(`${product.name} উইশলিস্ট থেকে সরানো হয়েছে`);
      }
    } else {
      toast.error(result.error || "সমস্যা হয়েছে");
    }

    onAddToWishlist?.(product);
    setIsTogglingWishlist(false);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || isAddingToCart) return;

    setIsAddingToCart(true);

    const result = await addItem({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      stock: product.stock || 99, // Default stock if not provided
    });

    setIsAddingToCart(false);

    if (result.success) {
      setJustAdded(true);
      toast.success(`${product.name} কার্টে যোগ করা হয়েছে`);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      toast.error(result.error || "কার্টে যোগ করা যায়নি");
    }
  };

  const discountPercentage = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : product.discount;

  return (
    <Link href={`/products/${product.id}`}>
      <article
        className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{ boxShadow: "var(--shadow-card)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                নতুন
              </Badge>
            )}
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {discountPercentage}% ছাড়
              </Badge>
            )}
            {product.hasCOD && (
              <Badge className="bg-success text-success-foreground text-xs">
                COD
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={isTogglingWishlist}
            className={cn(
              "absolute top-2 right-2 p-2 bg-card/80 backdrop-blur-sm rounded-full transition-all hover:bg-card",
              isTogglingWishlist && "opacity-70"
            )}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted
                    ? "fill-destructive text-destructive"
                    : "text-foreground"
                )}
              />
            )}
          </button>

          {/* Quick Add Button */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-2 transition-all duration-300",
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            )}
          >
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={cn(
                "w-full gap-2",
                justAdded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-brand-orange-dark",
                "text-primary-foreground"
              )}
              size="sm"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  যোগ হচ্ছে...
                </>
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  যোগ হয়েছে
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {product.inStock ? "কার্টে যোগ করুন" : "স্টক শেষ"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
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
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ৳{product.price.toLocaleString("bn-BD")}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.mrp.toLocaleString("bn-BD")}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            <span
              className={cn(
                "text-xs",
                product.inStock ? "text-success" : "text-destructive"
              )}
            >
              {product.inStock ? "স্টকে আছে" : "স্টক শেষ"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
