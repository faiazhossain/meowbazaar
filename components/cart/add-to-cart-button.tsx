"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    nameEn?: string;
    price: number;
    mrp?: number;
    image: string;
    stock: number;
    inStock?: boolean;
  };
  quantity?: number;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  children,
}: AddToCartButtonProps) {
  const { addItem, isPending } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0 || product.inStock === false;

  const handleAddToCart = async () => {
    if (isOutOfStock || isPending) return;

    const result = await addItem(product, quantity);

    if (result.success) {
      setIsAdded(true);
      toast.success(`${product.name} কার্টে যোগ করা হয়েছে`);

      // Reset the added state after 2 seconds
      setTimeout(() => setIsAdded(false), 2000);
    } else {
      toast.error(result.error || "কার্টে যোগ করা যায়নি");
    }
  };

  if (isOutOfStock) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("cursor-not-allowed opacity-60", className)}
        disabled
      >
        স্টক নেই
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(isAdded && "bg-green-600 hover:bg-green-700", className)}
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          যোগ হচ্ছে...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          যোগ করা হয়েছে
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          {children || "কার্টে যোগ করুন"}
        </>
      )}
    </Button>
  );
}
