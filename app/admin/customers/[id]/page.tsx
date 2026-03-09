"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  Calendar,
  Clock,
  Ban,
  CheckCircle,
  Package,
  CreditCard,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getCustomerById, toggleCustomerStatus } from "@/lib/actions/admin";

interface CustomerDetails {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  loginCount: number;
  createdAt: Date;
  totalSpent: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  }>;
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    address: string;
    division: string;
    area: string;
    isDefault: boolean;
  }>;
  wishlist: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  }>;
  activities: Array<{
    id: string;
    type: string;
    metadata: string | null;
    createdAt: Date;
  }>;
  loginAttempts: Array<{
    id: string;
    success: boolean;
    ipAddress: string | null;
    createdAt: Date;
  }>;
  _count: {
    orders: number;
    reviews: number;
    wishlist: number;
  };
}

const ORDER_STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "পেন্ডিং", variant: "secondary" },
  CONFIRMED: { label: "কনফার্মড", variant: "default" },
  PROCESSING: { label: "প্রসেসিং", variant: "default" },
  SHIPPED: { label: "শিপড", variant: "outline" },
  DELIVERED: { label: "ডেলিভারড", variant: "default" },
  CANCELLED: { label: "বাতিল", variant: "destructive" },
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCustomer = async () => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      const result = await getCustomerById(params.id as string);
      setCustomer(result as CustomerDetails);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      toast.error("কাস্টমার লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const handleToggleStatus = () => {
    if (!customer) return;
    startTransition(async () => {
      const result = await toggleCustomerStatus(customer.id);
      if (result.success) {
        toast.success(
          result.isActive
            ? "কাস্টমার অ্যাক্টিভ করা হয়েছে"
            : "কাস্টমার নিষ্ক্রিয় করা হয়েছে"
        );
        fetchCustomer();
      } else {
        toast.error(result.error);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">কাস্টমার পাওয়া যায়নি</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          ফিরে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">কাস্টমার বিস্তারিত</h1>
            <p className="text-muted-foreground">ID: {customer.id}</p>
          </div>
        </div>
        <Button
          variant={customer.isActive ? "destructive" : "default"}
          onClick={handleToggleStatus}
          disabled={isPending}
        >
          {customer.isActive ? (
            <>
              <Ban className="mr-2 h-4 w-4" />
              নিষ্ক্রিয় করুন
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              অ্যাক্টিভ করুন
            </>
          )}
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shrink-0">
              {customer.image ? (
                <img
                  src={customer.image}
                  alt=""
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {customer.name || "নাম নেই"}
                </h2>
                <Badge variant={customer.isActive ? "default" : "secondary"}>
                  {customer.isActive ? "অ্যাক্টিভ" : "নিষ্ক্রিয়"}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customer.phone || "ফোন নেই"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  রেজিস্ট্রেশন:{" "}
                  {format(new Date(customer.createdAt), "dd MMM yyyy", {
                    locale: bn,
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  সর্বশেষ লগইন:{" "}
                  {customer.lastLoginAt
                    ? format(
                        new Date(customer.lastLoginAt),
                        "dd MMM yyyy, hh:mm a",
                        {
                          locale: bn,
                        }
                      )
                    : "কখনো না"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customer.totalSpent)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">উইশলিস্ট</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count.wishlist}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">লগইন সংখ্যা</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.loginCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">
            অর্ডার ({customer.orders.length})
          </TabsTrigger>
          <TabsTrigger value="addresses">
            ঠিকানা ({customer.addresses.length})
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            উইশলিস্ট ({customer.wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="activity">অ্যাক্টিভিটি</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {customer.orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">কোন অর্ডার নেই</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>অর্ডার নম্বর</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>আইটেম</TableHead>
                    <TableHead>মোট</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "dd MMM yyyy", {
                          locale: bn,
                        })}
                      </TableCell>
                      <TableCell>{order.items.length} টি</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ORDER_STATUS_MAP[order.status]?.variant ||
                            "secondary"
                          }
                        >
                          {ORDER_STATUS_MAP[order.status]?.label ||
                            order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>দেখুন</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          {customer.addresses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">কোন ঠিকানা নেই</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customer.addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {address.fullName}
                      </CardTitle>
                      {address.isDefault && (
                        <Badge variant="outline">ডিফল্ট</Badge>
                      )}
                    </div>
                    <CardDescription>{address.phone}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{address.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.area}, {address.division}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-4">
          {customer.wishlist.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">উইশলিস্ট খালি</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {customer.wishlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="aspect-square w-full rounded-lg object-cover mb-3"
                    />
                    <p className="font-medium line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-primary font-semibold">
                      {formatCurrency(item.product.price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle>সাম্প্রতিক অ্যাক্টিভিটি</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    কোন অ্যাক্টিভিটি নেই
                  </p>
                ) : (
                  <div className="space-y-4">
                    {customer.activities.map((activity) => {
                      const activityLabels: Record<string, string> = {
                        PRODUCT_VIEW: "প্রোডাক্ট দেখেছে",
                        SEARCH: "সার্চ করেছে",
                        ADD_TO_CART: "কার্টে যোগ করেছে",
                        CHECKOUT_START: "চেকআউট শুরু করেছে",
                        ORDER_PLACED: "অর্ডার করেছে",
                        REGISTER: "রেজিস্টার করেছে",
                        LOGIN: "লগইন করেছে",
                      };
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                          <div>
                            <p>
                              {activityLabels[activity.type] || activity.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(activity.createdAt),
                                "dd MMM yyyy, hh:mm a",
                                { locale: bn }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Login History */}
            <Card>
              <CardHeader>
                <CardTitle>লগইন হিস্ট্রি</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.loginAttempts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    কোন লগইন হিস্ট্রি নেই
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customer.loginAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {attempt.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Ban className="h-4 w-4 text-red-500" />
                          )}
                          <span>{attempt.success ? "সফল" : "ব্যর্থ"}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {format(
                            new Date(attempt.createdAt),
                            "dd MMM, hh:mm a",
                            { locale: bn }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
