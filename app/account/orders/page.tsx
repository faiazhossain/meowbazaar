"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/ui/product-badges"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { allProducts } from "@/lib/data"
import { cn } from "@/lib/utils"

const orders = [
  {
    id: "#MB2024030912",
    date: "৯ মার্চ, ২০২৬",
    total: 3450,
    status: "shipped" as const,
    items: [
      { ...allProducts[0], quantity: 2 },
      { ...allProducts[2], quantity: 1 },
    ],
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    paymentMethod: "ক্যাশ অন ডেলিভারি",
    timeline: [
      { status: "অর্ডার প্লেসড", date: "৯ মার্চ, ১০:৩০ AM", completed: true },
      { status: "কনফার্মড", date: "৯ মার্চ, ১১:০০ AM", completed: true },
      { status: "শিপড", date: "৯ মার্চ, ২:০০ PM", completed: true },
      { status: "ডেলিভারড", date: "অপেক্ষমাণ", completed: false },
    ],
  },
  {
    id: "#MB2024030845",
    date: "৫ মার্চ, ২০২৬",
    total: 1200,
    status: "delivered" as const,
    items: [{ ...allProducts[3], quantity: 1 }],
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    paymentMethod: "বিকাশ",
    timeline: [
      { status: "অর্ডার প্লেসড", date: "৫ মার্চ, ০৯:০০ AM", completed: true },
      { status: "কনফার্মড", date: "৫ মার্চ, ০৯:৩০ AM", completed: true },
      { status: "শিপড", date: "৫ মার্চ, ১২:০০ PM", completed: true },
      { status: "ডেলিভারড", date: "৬ মার্চ, ১১:০০ AM", completed: true },
    ],
  },
  {
    id: "#MB2024030701",
    date: "১ মার্চ, ২০২৬",
    total: 780,
    status: "delivered" as const,
    items: [{ ...allProducts[5], quantity: 1 }],
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    paymentMethod: "নগদ",
    timeline: [
      { status: "অর্ডার প্লেসড", date: "১ মার্চ, ০২:০০ PM", completed: true },
      { status: "কনফার্মড", date: "১ মার্চ, ০২:৩০ PM", completed: true },
      { status: "শিপড", date: "১ মার্চ, ০৫:০০ PM", completed: true },
      { status: "ডেলিভারড", date: "২ মার্চ, ১০:০০ AM", completed: true },
    ],
  },
]

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">আমার অর্ডার</h1>
        <p className="text-muted-foreground">আপনার সকল অর্ডারের তালিকা</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">কোনো অর্ডার নেই</h2>
          <p className="text-muted-foreground mb-4">আপনি এখনো কোনো অর্ডার করেননি</p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
              শপিং শুরু করুন
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-lg overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        বিস্তারিত <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>অর্ডার {order.id}</DialogTitle>
                      </DialogHeader>
                      <OrderDetails order={order} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-card bg-muted"
                        style={{ zIndex: 3 - index }}
                      >
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border-2 border-card">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} পণ্য
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    ৳{order.total.toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderDetails({ order }: { order: typeof orders[0] }) {
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div>
        <h3 className="font-medium text-foreground mb-4">অর্ডার ট্র্যাকিং</h3>
        <div className="space-y-0">
          {order.timeline.map((step, index) => (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    step.completed ? "bg-success" : "bg-muted"
                  )}
                />
                {index < order.timeline.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-8",
                      step.completed ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="pb-4">
                <p className={cn("font-medium", step.completed ? "text-foreground" : "text-muted-foreground")}>
                  {step.status}
                </p>
                <p className="text-sm text-muted-foreground">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="font-medium text-foreground mb-4">অর্ডার আইটেম</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </div>
              <p className="font-medium text-foreground">
                ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">ডেলিভারি ঠিকানা</p>
          <p className="text-sm font-medium text-foreground">{order.address}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">পেমেন্ট পদ্ধতি</p>
          <p className="text-sm font-medium text-foreground">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 border-t border-border">
        <span className="font-semibold text-foreground">মোট</span>
        <span className="text-xl font-bold text-primary">
          ৳{order.total.toLocaleString("bn-BD")}
        </span>
      </div>
    </div>
  )
}
