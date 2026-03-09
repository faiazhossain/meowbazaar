"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartDrawerProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  trigger?: React.ReactNode
}

export function CartDrawer({ items, onUpdateQuantity, onRemoveItem, trigger }: CartDrawerProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative text-foreground">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-foreground">
            আপনার কার্ট ({itemCount} পণ্য)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">আপনার কার্ট খালি</h3>
              <p className="text-sm text-muted-foreground">
                এখনো কোনো পণ্য যোগ করা হয়নি
              </p>
            </div>
            <SheetClose asChild>
              <Link href="/products">
                <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
                  শপিং চালিয়ে যান
                </Button>
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto py-4 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-primary font-semibold">
                        ৳{item.price.toLocaleString("bn-BD")}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1.5 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">সাবটোটাল</span>
                <span className="font-semibold text-foreground">
                  ৳{subtotal.toLocaleString("bn-BD")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ডেলিভারি চার্জ চেকআউটে যোগ হবে
              </p>
              <div className="grid gap-2">
                <SheetClose asChild>
                  <Link href="/checkout">
                    <Button className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground">
                      চেকআউট করুন
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/products">
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                      শপিং চালিয়ে যান
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
