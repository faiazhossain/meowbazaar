"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { ProductGrid } from "@/components/ui/section"
import { allProducts } from "@/lib/data"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(allProducts.slice(0, 5))

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems((items) => items.filter((item) => item.id !== productId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">আমার উইশলিস্ট</h1>
        <p className="text-muted-foreground">{wishlistItems.length} পণ্য সেভ করা আছে</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            আপনার উইশলিস্ট খালি
          </h2>
          <p className="text-muted-foreground mb-4">
            পছন্দের পণ্য সেভ করুন পরে কেনার জন্য
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
              শপিং শুরু করুন
            </Button>
          </Link>
        </div>
      ) : (
        <ProductGrid>
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToWishlist={() => handleRemoveFromWishlist(product.id)}
            />
          ))}
        </ProductGrid>
      )}
    </div>
  )
}
