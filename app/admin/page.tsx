import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  AlertTriangle,
  Eye,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/product-badges";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/lib/actions/analytics";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export default async function AdminDashboard() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে
        </p>
      </div>
    );
  }

  const { overview, recentOrders, recentUsers, unreadNotifications } =
    result.data;

  const stats = [
    {
      title: "এই মাসের অর্ডার",
      value: overview.ordersThisMonth.toString(),
      change: `${overview.ordersChange > 0 ? "+" : ""}${overview.ordersChange}%`,
      trend: overview.ordersChange >= 0 ? ("up" as const) : ("down" as const),
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "এই মাসের রেভিনিউ",
      value: `৳${overview.revenueThisMonth.toLocaleString("bn-BD")}`,
      change: `${overview.revenueChange > 0 ? "+" : ""}${overview.revenueChange}%`,
      trend: overview.revenueChange >= 0 ? ("up" as const) : ("down" as const),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "মোট পণ্য",
      value: overview.totalProducts.toString(),
      change:
        overview.lowStockProducts > 0
          ? `${overview.lowStockProducts} low stock`
          : "All good",
      trend:
        overview.lowStockProducts > 0 ? ("down" as const) : ("up" as const),
      icon: Package,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "মোট কাস্টমার",
      value: overview.totalUsers.toLocaleString("bn-BD"),
      change: `${overview.usersChange > 0 ? "+" : ""}${overview.usersChange}%`,
      trend: overview.usersChange >= 0 ? ("up" as const) : ("down" as const),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">
            স্বাগতম, PetBazaar Admin Panel এ
          </p>
        </div>
        {unreadNotifications > 0 && (
          <Link href="/admin/notifications">
            <Button variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              <span>{unreadNotifications} নতুন নোটিফিকেশন</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Pending Orders Alert */}
      {overview.pendingOrders > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {overview.pendingOrders}টি অর্ডার পেন্ডিং আছে
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                অনুগ্রহ করে অর্ডারগুলো প্রসেস করুন
              </p>
            </div>
          </div>
          <Link href="/admin/orders?status=PENDING">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              দেখুন
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card rounded-lg p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    stat.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div
          className="lg:col-span-2 bg-card rounded-lg"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              সাম্প্রতিক অর্ডার
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:text-brand-orange-dark flex items-center gap-1"
            >
              সব দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              এখনো কোনো অর্ডার নেই
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map(
                (order: {
                  id: string;
                  orderNumber: string;
                  user: { name: string | null; email: string | null };
                  total: number;
                  status:
                    | "PENDING"
                    | "CONFIRMED"
                    | "PROCESSING"
                    | "SHIPPED"
                    | "DELIVERED"
                    | "CANCELLED";
                  createdAt: Date;
                }) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name || order.user?.email || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: bn,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ৳{order.total.toLocaleString("bn-BD")}
                      </p>
                      <OrderStatusBadge
                        status={
                          order.status.toLowerCase() as
                            | "pending"
                            | "confirmed"
                            | "processing"
                            | "shipped"
                            | "delivered"
                            | "cancelled"
                        }
                      />
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* New Customers */}
        <div
          className="bg-card rounded-lg"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                নতুন কাস্টমার
              </h2>
            </div>
            <Link
              href="/admin/customers"
              className="text-sm text-primary hover:text-brand-orange-dark"
            >
              সব দেখুন
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              এখনো কোনো কাস্টমার নেই
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentUsers.map(
                (user: {
                  id: string;
                  name: string | null;
                  email: string | null;
                  createdAt: Date;
                  _count: { orders: number };
                }) => (
                  <Link
                    key={user.id}
                    href={`/admin/customers/${user.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {user.name || "নাম নেই"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {user._count.orders} অর্ডার
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: bn,
                        })}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
          <div className="p-4 border-t border-border">
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full">
                সব কাস্টমার দেখুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="bg-card rounded-lg p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          দ্রুত অ্যাকশন
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/products/new">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <Package className="h-6 w-6 text-primary" />
              <span>নতুন পণ্য</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span>অর্ডার দেখুন</span>
            </Button>
          </Link>
          <Link href="/admin/customers">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <Users className="h-6 w-6 text-primary" />
              <span>কাস্টমার</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>অ্যানালিটিক্স</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
