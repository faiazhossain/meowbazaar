"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";

interface CartButtonProps {
  serverCartCount?: number;
}

export function CartButton({ serverCartCount = 0 }: CartButtonProps) {
  const { itemCount, isLoading, isAuthenticated } = useCart();

  // Use server cart count initially for authenticated users to avoid hydration mismatch
  // Then switch to client-side count once hydrated
  const displayCount = isLoading
    ? serverCartCount
    : isAuthenticated
      ? itemCount || serverCartCount
      : itemCount;

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative text-foreground"
        disabled
      >
        <ShoppingCart className="h-5 w-5" />
        {serverCartCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
            {serverCartCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative text-foreground">
        <ShoppingCart className="h-5 w-5" />
        {displayCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
            {displayCount > 99 ? "99+" : displayCount}
          </Badge>
        )}
        <span className="sr-only">Cart</span>
      </Button>
    </Link>
  );
}
