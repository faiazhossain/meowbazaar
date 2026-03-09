"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  Printer,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getOrderById, updateOrderStatus } from "@/lib/actions/admin";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
  address: {
    fullName: string;
    phone: string;
    address: string;
    division: string;
    area: string;
  } | null;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      slug: string;
      image: string;
      name: string;
    };
  }>;
  timeline: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: Date;
  }>;
}

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Clock;
    color: string;
  }
> = {
  PENDING: {
    label: "পেন্ডিং",
    variant: "secondary",
    icon: Clock,
    color: "text-yellow-500",
  },
  CONFIRMED: {
    label: "কনফার্মড",
    variant: "default",
    icon: CheckCircle,
    color: "text-green-500",
  },
  PROCESSING: {
    label: "প্রসেসিং",
    variant: "outline",
    icon: RefreshCw,
    color: "text-blue-500",
  },
  SHIPPED: {
    label: "শিপড",
    variant: "outline",
    icon: Truck,
    color: "text-purple-500",
  },
  DELIVERED: {
    label: "ডেলিভারড",
    variant: "default",
    icon: Package,
    color: "text-green-500",
  },
  CANCELLED: {
    label: "বাতিল",
    variant: "destructive",
    icon: XCircle,
    color: "text-red-500",
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");

  const fetchOrder = async () => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      const result = await getOrderById(params.id as string);
      setOrder(result as OrderDetails);
      if (result) {
        setNewStatus(result.status as OrderStatus);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return;

    startTransition(async () => {
      const result = await updateOrderStatus(
        order.id,
        newStatus,
        statusNote || undefined
      );
      if (result.success) {
        toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে");
        setStatusNote("");
        fetchOrder();
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

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">অর্ডার পাওয়া যায়নি</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          ফিরে যান
        </Button>
      </div>
    );
  }

  const StatusIcon = ORDER_STATUS_CONFIG[order.status]?.icon || Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                অর্ডার #{order.orderNumber}
              </h1>
              <Badge
                variant={
                  ORDER_STATUS_CONFIG[order.status]?.variant || "secondary"
                }
                className="gap-1"
              >
                <StatusIcon className="h-3 w-3" />
                {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {format(new Date(order.createdAt), "dd MMMM yyyy, hh:mm a", {
                locale: bn,
              })}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          ইনভয়েস প্রিন্ট
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার আইটেম</CardTitle>
              <CardDescription>
                {order.items.length} টি প্রোডাক্ট
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-primary line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">সাবটোটাল</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>মোট</span>
                  <span className="text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার টাইমলাইন</CardTitle>
            </CardHeader>
            <CardContent>
              {order.timeline.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  টাইমলাইন তথ্য নেই
                </p>
              ) : (
                <div className="space-y-4">
                  {order.timeline.map((event, index) => {
                    const config =
                      ORDER_STATUS_CONFIG[event.status as OrderStatus];
                    const EventIcon = config?.icon || Clock;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="relative">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted ${config?.color || ""}`}
                          >
                            <EventIcon className="h-4 w-4" />
                          </div>
                          {index < order.timeline.length - 1 && (
                            <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">
                            {config?.label || event.status}
                          </p>
                          {event.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.note}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(event.createdAt),
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                কাস্টমার তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {order.user.image ? (
                    <Image
                      src={order.user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{order.user.name || "নাম নেই"}</p>
                  <Link
                    href={`/admin/customers/${order.user.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    প্রোফাইল দেখুন
                  </Link>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {order.user.email}
                </div>
                {order.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.user.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  ডেলিভারি ঠিকানা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p className="text-muted-foreground">
                  {order.address.address}, {order.address.area},{" "}
                  {order.address.division}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                পেমেন্ট তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">পেমেন্ট স্ট্যাটাস</span>
                <Badge
                  variant={
                    order.paymentStatus === "PAID" ? "default" : "secondary"
                  }
                >
                  {order.paymentStatus === "PAID" ? "পেইড" : "আনপেইড"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <Card>
              <CardHeader>
                <CardTitle>স্ট্যাটাস আপডেট</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">পেন্ডিং</SelectItem>
                    <SelectItem value="CONFIRMED">কনফার্মড</SelectItem>
                    <SelectItem value="PROCESSING">প্রসেসিং</SelectItem>
                    <SelectItem value="SHIPPED">শিপড</SelectItem>
                    <SelectItem value="DELIVERED">ডেলিভারড</SelectItem>
                    <SelectItem value="CANCELLED">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="নোট (ঐচ্ছিক)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleStatusUpdate}
                  disabled={isPending || newStatus === order.status}
                >
                  {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  আপডেট করুন
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
