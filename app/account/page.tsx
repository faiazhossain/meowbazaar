import Link from "next/link"
import { Package, Heart, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/ui/product-badges"

const recentOrders = [
  {
    id: "#MB2024030912",
    date: "৯ মার্চ, ২০২৬",
    total: 3450,
    status: "shipped" as const,
    items: 3,
  },
  {
    id: "#MB2024030845",
    date: "৫ মার্চ, ২০২৬",
    total: 1200,
    status: "delivered" as const,
    items: 1,
  },
]

export default function AccountDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">স্বাগতম, মোঃ আব্দুল্লাহ!</h1>
        <p className="text-muted-foreground">আপনার একাউন্ট ড্যাশবোর্ড</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">মোট অর্ডার</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-sm text-muted-foreground">উইশলিস্ট</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">সেভড ঠিকানা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">সাম্প্রতিক অর্ডার</h2>
          <Link href="/account/orders" className="text-sm text-primary hover:text-brand-orange-dark flex items-center gap-1">
            সব দেখুন <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">৳{order.total.toLocaleString("bn-BD")}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">একাউন্ট তথ্য</h2>
          <Link href="/account/profile">
            <Button variant="outline" size="sm">এডিট করুন</Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">নাম</p>
            <p className="font-medium text-foreground">মোঃ আব্দুল্লাহ</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ফোন</p>
            <p className="font-medium text-foreground">+880 1712-345678</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ইমেইল</p>
            <p className="font-medium text-foreground">abdullah@example.com</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">মেম্বার সিন্স</p>
            <p className="font-medium text-foreground">জানুয়ারি ২০২৫</p>
          </div>
        </div>
      </div>
    </div>
  )
}
