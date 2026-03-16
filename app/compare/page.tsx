"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ShoppingCart, Star, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/hooks/use-comparison";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ComparePage() {
  const { items, isLoading, remove, clear } = useComparison();
  const { addItem, refreshCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (product: (typeof items)[0]) => {
    setAddingToCart(product.id);
    try {
      const result = await addItem(
        {
          id: product.id,
          name: product.name,
          nameEn: product.nameEn || undefined,
          price: product.price,
          mrp: product.mrp || undefined,
          image: product.image,
          stock: product.stock,
        },
        1
      );

      if (result.success) {
        await refreshCart();
        toast.success("Added to cart");
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No Products to Compare
          </h1>
          <p className="text-muted-foreground mb-6">
            Add products to compare their features side by side.
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Compare Products
          </h1>
          <p className="text-muted-foreground">
            Comparing {items.length} product{items.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => clear()}
          className="gap-2 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Product Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(180px, 1fr))` }}>
            {items.map((product) => {
              const discountPercentage = product.mrp
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  {/* Remove Button */}
                  <div className="flex justify-end p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(product.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Product Image */}
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {discountPercentage > 0 && (
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                          {discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category.name}
                    </p>

                    {/* Price */}
                    <div className="mt-2">
                      <span className="text-lg font-bold text-primary">
                        Tk {product.price.toLocaleString()}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          Tk {product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <Button
                      className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!product.inStock || addingToCart === product.id}
                      onClick={() => handleAddToCart(product)}
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Details Table */}
          <div className="bg-card rounded-lg border border-border">
            <table className="w-full">
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground bg-muted/50 w-32">
                    Price
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="font-bold text-primary">
                        Tk {product.price.toLocaleString()}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground bg-muted/50">
                    Rating
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground bg-muted/50">
                    Availability
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          product.inStock && product.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {product.inStock && product.stock > 0
                          ? `In Stock (${product.stock})`
                          : "Out of Stock"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Cash on Delivery Row */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-foreground bg-muted/50">
                    Cash on Delivery
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          product.hasCOD ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {product.hasCOD ? "Available" : "Not Available"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr>
                  <td className="p-4 font-medium text-foreground bg-muted/50">
                    Category
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <Link
                        href={`/products?category=${product.category.slug}`}
                        className="text-primary hover:underline"
                      >
                        {product.category.name}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
