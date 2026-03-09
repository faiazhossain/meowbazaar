import Link from "next/link"
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/ui/product-badges"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "আজকের অর্ডার",
    value: "12",
    change: "+15%",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "মোট রেভিনিউ",
    value: "৳45,230",
    change: "+8%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "মোট পণ্য",
    value: "156",
    change: "+3",
    trend: "up" as const,
    icon: Package,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "মোট কাস্টমার",
    value: "1,234",
    change: "+24",
    trend: "up" as const,
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
]

const recentOrders = [
  {
    id: "#MB2024030912",
    customer: "মোঃ আব্দুল্লাহ",
    date: "১০ মিনিট আগে",
    total: 3450,
    status: "pending" as const,
  },
  {
    id: "#MB2024030911",
    customer: "ফাতিমা বেগম",
    date: "২৫ মিনিট আগে",
    total: 1200,
    status: "confirmed" as const,
  },
  {
    id: "#MB2024030910",
    customer: "রহিম উদ্দিন",
    date: "১ ঘন্টা আগে",
    total: 5600,
    status: "shipped" as const,
  },
  {
    id: "#MB2024030909",
    customer: "করিম মিয়া",
    date: "২ ঘন্টা আগে",
    total: 890,
    status: "delivered" as const,
  },
]

const lowStockProducts = [
  { id: "1", name: "রয়্যাল ক্যানিন ইনডোর ক্যাট ফুড", stock: 3 },
  { id: "2", name: "ফেদার ওয়ান্ড ক্যাট টয়", stock: 5 },
  { id: "3", name: "ক্যাট লিটার ক্লাম্পিং", stock: 2 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">স্বাগতম, MeowBazaar Admin Panel এ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-card rounded-lg p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bgColor)}>
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  stat.trend === "up" ? "text-success" : "text-destructive"
                )}>
                  {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">সাম্প্রতিক অর্ডার</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:text-brand-orange-dark flex items-center gap-1">
              সব দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">৳{order.total.toLocaleString("bn-BD")}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">স্টক এলার্ট</h2>
            </div>
            <Link href="/admin/products" className="text-sm text-primary hover:text-brand-orange-dark">
              সব দেখুন
            </Link>
          </div>
          <div className="divide-y divide-border">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4">
                <p className="text-sm text-foreground line-clamp-1 flex-1 mr-4">{product.name}</p>
                <span className="text-sm font-medium text-destructive shrink-0">
                  {product.stock} বাকি
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <Link href="/admin/products">
              <Button variant="outline" className="w-full">
                সব পণ্য দেখুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">দ্রুত অ্যাকশন</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/products/new">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span>নতুন পণ্য</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span>অর্ডার দেখুন</span>
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span>ক্যাটাগরি</span>
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>রিপোর্ট</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
