"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";

interface WishlistButtonProps {
  serverWishlistCount?: number;
}

export function WishlistButton({
  serverWishlistCount = 0,
}: WishlistButtonProps) {
  const { itemCount, isLoading, isAuthenticated } = useWishlist();

  // Use server count initially for authenticated users to avoid hydration mismatch
  // Then switch to client-side count once hydrated
  const displayCount = isLoading
    ? serverWishlistCount
    : isAuthenticated
      ? itemCount || serverWishlistCount
      : 0;

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative text-foreground"
        disabled
      >
        <Heart className="h-5 w-5" />
        {serverWishlistCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
            {serverWishlistCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Link href="/account/wishlist">
      <Button variant="ghost" size="icon" className="relative text-foreground">
        <Heart className="h-5 w-5" />
        {displayCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
            {displayCount > 99 ? "99+" : displayCount}
          </Badge>
        )}
        <span className="sr-only">Wishlist</span>
      </Button>
    </Link>
  );
}
