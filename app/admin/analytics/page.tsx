"use client";

import { useEffect, useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Package,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getAnalyticsData, getDashboardStats } from "@/lib/actions/analytics";

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    userId: string | null;
    createdAt: Date;
  }>;
  recentLogins: Array<{
    id: string;
    email: string;
    success: boolean;
    ipAddress: string | null;
    createdAt: Date;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  ordersByStatus: Record<string, number>;
  dailyStats: Array<{
    date: Date;
    orders: number;
    revenue: number;
    users: number;
  }>;
}

const ACTIVITY_ICONS: Record<string, typeof Eye> = {
  VIEW_PRODUCT: Eye,
  ADD_TO_WISHLIST: Heart,
  ADD_TO_CART: ShoppingCart,
  CHECKOUT: Package,
  REGISTRATION: UserPlus,
  LOGIN: LogIn,
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAnalyticsData(period);
      setData(result as AnalyticsData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("bn-BD").format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          অ্যানালিটিক্স লোড করতে সমস্যা হয়েছে
        </h2>
        <Button onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">
            বিস্তারিত বিশ্লেষণ এবং রিপোর্ট
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">গত ৭ দিন</SelectItem>
              <SelectItem value="30d">গত ৩০ দিন</SelectItem>
              <SelectItem value="90d">গত ৯০ দিন</SelectItem>
              <SelectItem value="all">সব সময়</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট রেভিনিউ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              আজ {formatCurrency(data.revenueToday)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              আজ {formatNumber(data.ordersToday)} টি
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কাস্টমার</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              আজ {formatNumber(data.newUsersToday)} জন নতুন
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট প্রোডাক্ট</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalProducts)}
            </div>
            <p className="text-xs text-muted-foreground">অ্যাক্টিভ প্রোডাক্ট</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Stats */}
        <Card>
          <CardHeader>
            <CardTitle>দৈনিক পারফরম্যান্স</CardTitle>
            <CardDescription>অর্ডার এবং রেভিনিউ ট্রেন্ড</CardDescription>
          </CardHeader>
          <CardContent>
            {data.dailyStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ডেটা নেই</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <span>তারিখ</span>
                  <span className="text-center">অর্ডার</span>
                  <span className="text-center">রেভিনিউ</span>
                  <span className="text-center">নতুন ইউজার</span>
                </div>
                {data.dailyStats.slice(0, 7).map((day) => (
                  <div
                    key={day.date.toString()}
                    className="grid grid-cols-4 text-sm py-2 border-b border-dashed"
                  >
                    <span>
                      {format(new Date(day.date), "dd MMM", { locale: bn })}
                    </span>
                    <span className="text-center font-medium">
                      {day.orders}
                    </span>
                    <span className="text-center font-medium">
                      {formatCurrency(day.revenue)}
                    </span>
                    <span className="text-center font-medium">{day.users}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>অর্ডার স্ট্যাটাস</CardTitle>
            <CardDescription>বর্তমান অর্ডারের অবস্থা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.ordersByStatus).map(([status, count]) => {
                const percentage =
                  data.totalOrders > 0 ? (count / data.totalOrders) * 100 : 0;
                const statusLabels: Record<string, string> = {
                  PENDING: "পেন্ডিং",
                  CONFIRMED: "কনফার্মড",
                  PROCESSING: "প্রসেসিং",
                  SHIPPED: "শিপড",
                  DELIVERED: "ডেলিভারড",
                  CANCELLED: "বাতিল",
                };
                const colors: Record<string, string> = {
                  PENDING: "bg-yellow-500",
                  CONFIRMED: "bg-blue-500",
                  PROCESSING: "bg-purple-500",
                  SHIPPED: "bg-indigo-500",
                  DELIVERED: "bg-green-500",
                  CANCELLED: "bg-red-500",
                };
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{statusLabels[status] || status}</span>
                      <span className="font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status] || "bg-gray-500"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>টপ সেলিং প্রোডাক্ট</CardTitle>
            <CardDescription>সবচেয়ে বেশি বিক্রিত প্রোডাক্ট</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ডেটা নেই</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>প্রোডাক্ট</TableHead>
                    <TableHead className="text-center">বিক্রি</TableHead>
                    <TableHead className="text-right">রেভিনিউ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="font-medium line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.totalSold}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক অ্যাক্টিভিটি</CardTitle>
            <CardDescription>ইউজার অ্যাক্টিভিটি লগ</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activities">
              <TabsList className="mb-4">
                <TabsTrigger value="activities">অ্যাক্টিভিটি</TabsTrigger>
                <TabsTrigger value="logins">লগইন</TabsTrigger>
              </TabsList>
              <TabsContent value="activities">
                {data.recentActivities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    কোন অ্যাক্টিভিটি নেই
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {data.recentActivities.map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.type] || Eye;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(activity.createdAt),
                                "dd MMM, hh:mm a",
                                { locale: bn }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="logins">
                {data.recentLogins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    কোন লগইন নেই
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {data.recentLogins.map((login) => (
                      <div
                        key={login.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {login.success ? (
                            <Badge variant="default" className="h-6">
                              সফল
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="h-6">
                              ব্যর্থ
                            </Badge>
                          )}
                          <span className="font-medium">{login.email}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {format(
                            new Date(login.createdAt),
                            "dd MMM, hh:mm a",
                            { locale: bn }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
