"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, ChevronDown, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "@/components/ui/product-badges"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    customer: { name: "মোঃ আব্দুল্লাহ", phone: "01712345678", email: "abdullah@example.com" },
    date: "৯ মার্চ, ২০২৬",
    total: 3450,
    status: "pending" as const,
    items: [
      { ...allProducts[0], quantity: 2 },
      { ...allProducts[2], quantity: 1 },
    ],
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    paymentMethod: "ক্যাশ অন ডেলিভারি",
  },
  {
    id: "#MB2024030911",
    customer: { name: "ফাতিমা বেগম", phone: "01812345678", email: "fatima@example.com" },
    date: "৯ মার্চ, ২০২৬",
    total: 1200,
    status: "confirmed" as const,
    items: [{ ...allProducts[3], quantity: 1 }],
    address: "বাড়ি ৫, রোড ১০, মিরপুর, ঢাকা",
    paymentMethod: "বিকাশ",
  },
  {
    id: "#MB2024030910",
    customer: { name: "রহিম উদ্দিন", phone: "01912345678", email: "rahim@example.com" },
    date: "৮ মার্চ, ২০২৬",
    total: 5600,
    status: "shipped" as const,
    items: [
      { ...allProducts[0], quantity: 1 },
      { ...allProducts[1], quantity: 2 },
      { ...allProducts[4], quantity: 1 },
    ],
    address: "বাড়ি ২০, রোড ৩, উত্তরা, ঢাকা",
    paymentMethod: "নগদ",
  },
  {
    id: "#MB2024030909",
    customer: { name: "করিম মিয়া", phone: "01612345678", email: "karim@example.com" },
    date: "৭ মার্চ, ২০২৬",
    total: 890,
    status: "delivered" as const,
    items: [{ ...allProducts[5], quantity: 1 }],
    address: "বাড়ি ১৫, রোড ৮, বনানী, ঢাকা",
    paymentMethod: "কার্ড",
  },
  {
    id: "#MB2024030908",
    customer: { name: "সুমাইয়া আক্তার", phone: "01512345678", email: "sumaiya@example.com" },
    date: "৬ মার্চ, ২০২৬",
    total: 2340,
    status: "cancelled" as const,
    items: [{ ...allProducts[2], quantity: 2 }],
    address: "বাড়ি ৮, রোড ১২, গুলশান, ঢাকা",
    paymentMethod: "ক্যাশ অন ডেলিভারি",
  },
]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">সকল অর্ডার দেখুন এবং ম্যানেজ করুন</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="অর্ডার আইডি, কাস্টমার নাম বা ফোন দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="pending">পেন্ডিং</SelectItem>
            <SelectItem value="confirmed">নিশ্চিত</SelectItem>
            <SelectItem value="shipped">শিপড</SelectItem>
            <SelectItem value="delivered">ডেলিভারড</SelectItem>
            <SelectItem value="cancelled">বাতিল</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">অর্ডার</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">কাস্টমার</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">তারিখ</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">মোট</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">স্ট্যাটাস</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="font-medium text-foreground">{order.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-muted-foreground">{order.date}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-foreground">
                      ৳{order.total.toLocaleString("bn-BD")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>অর্ডার {order.id}</DialogTitle>
                          </DialogHeader>
                          <OrderDetails order={order} />
                        </DialogContent>
                      </Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>স্ট্যাটাস আপডেট</DropdownMenuItem>
                          <DropdownMenuItem>ইনভয়েস প্রিন্ট</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            অর্ডার বাতিল
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderDetails({ order }: { order: typeof orders[0] }) {
  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div>
        <h3 className="font-medium text-foreground mb-3">কাস্টমার তথ্য</h3>
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">নাম</p>
            <p className="font-medium text-foreground">{order.customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ফোন</p>
            <p className="font-medium text-foreground">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ইমেইল</p>
            <p className="font-medium text-foreground">{order.customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">পেমেন্ট</p>
            <p className="font-medium text-foreground">{order.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <h3 className="font-medium text-foreground mb-3">ডেলিভারি ঠিকানা</h3>
        <p className="text-muted-foreground p-4 bg-muted rounded-lg">{order.address}</p>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="font-medium text-foreground mb-3">অর্ডার আইটেম</h3>
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

      {/* Status Update */}
      <div>
        <h3 className="font-medium text-foreground mb-3">স্ট্যাটাস আপডেট</h3>
        <Select defaultValue={order.status}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">পেন্ডিং</SelectItem>
            <SelectItem value="confirmed">নিশ্চিত</SelectItem>
            <SelectItem value="shipped">শিপড</SelectItem>
            <SelectItem value="delivered">ডেলিভারড</SelectItem>
            <SelectItem value="cancelled">বাতিল</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 border-t border-border">
        <span className="font-semibold text-foreground">মোট</span>
        <span className="text-xl font-bold text-primary">
          ৳{order.total.toLocaleString("bn-BD")}
        </span>
      </div>

      <Button className="w-full bg-primary hover:bg-brand-orange-dark text-primary-foreground">
        আপডেট সেভ করুন
      </Button>
    </div>
  )
}
