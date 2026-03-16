import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Package } from "lucide-react";
import { getSharedWishlistByToken } from "@/lib/actions/wishlist-share";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SharedWishlistPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function SharedWishlistPage({
  params,
}: SharedWishlistPageProps) {
  const { token } = await params;
  const sharedWishlist = await getSharedWishlistByToken(token);

  if (!sharedWishlist) {
    notFound();
  }

  const { user, products, viewCount, createdAt } = sharedWishlist;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary fill-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {user.name}'s Wishlist
          </h1>
          <p className="text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} |{" "}
            {viewCount} view{viewCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Products Yet
            </h2>
            <p className="text-muted-foreground">
              This wishlist is empty. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const discountPercentage = product.mrp
                ? Math.round(
                    ((product.mrp - product.price) / product.mrp) * 100
                  )
                : 0;
              const isOutOfStock = !product.inStock || product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-lg border border-border overflow-hidden group"
                >
                  {/* Product Image */}
                  <Link
                    href={`/products/${product.id}`}
                    className="relative block aspect-square bg-muted"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isOutOfStock && (
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
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      {product.category.name}
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground">
                        {product.price.toFixed(0)} ({product.stock} available)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-bold text-primary">
                        Tk {product.price.toLocaleString()}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          Tk {product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <Link href={`/products/${product.id}`}>
                      <Button
                        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Shared on {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <Link href="/">
            <Button variant="outline">
              Visit PetBazaar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
