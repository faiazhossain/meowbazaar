"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/product-badges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CatLoader } from "@/components/ui/cat-loader";
import { cn } from "@/lib/utils";
import { getOrders } from "@/lib/actions/orders";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderTimeline {
  id: string;
  status: string;
  note: string | null;
  createdAt: Date;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  division: string;
  area: string;
  address: string;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
  address: Address;
  timeline: OrderTimeline[];
}

const statusSteps = [
  { key: "PENDING", label: "অর্ডার প্লেসড" },
  { key: "CONFIRMED", label: "কনফার্মড" },
  { key: "PROCESSING", label: "প্রসেসিং" },
  { key: "SHIPPED", label: "শিপড" },
  { key: "DELIVERED", label: "ডেলিভারড" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data as Order[]);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cod: "ক্যাশ অন ডেলিভারি",
      bkash: "বিকাশ",
      nagad: "নগদ",
      rocket: "রকেট",
      card: "কার্ড",
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <CatLoader text="অর্ডার লোড হচ্ছে..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">আমার অর্ডার</h1>
        <p className="text-muted-foreground">আপনার সকল অর্ডারের তালিকা</p>
      </div>

      {orders.length === 0 ? (
        <div
          className="bg-card rounded-lg p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            কোনো অর্ডার নেই
          </h2>
          <p className="text-muted-foreground mb-4">
            আপনি এখনো কোনো অর্ডার করেননি
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground">
              <ShoppingBag className="w-4 h-4 mr-2" />
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
                    <p className="font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge
                    status={order.status.toLowerCase() as any}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        বিস্তারিত <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>অর্ডার {order.orderNumber}</DialogTitle>
                      </DialogHeader>
                      <OrderDetails
                        order={order}
                        formatDateTime={formatDateTime}
                        getPaymentMethodLabel={getPaymentMethodLabel}
                      />
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
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
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
  );
}

function OrderDetails({
  order,
  formatDateTime,
  getPaymentMethodLabel,
}: {
  order: Order;
  formatDateTime: (date: Date) => string;
  getPaymentMethodLabel: (method: string) => string;
}) {
  // Build timeline from order status
  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  const timeline = statusSteps.map((step, index) => {
    const timelineEntry = order.timeline.find((t) => t.status === step.key);
    const isCompleted =
      index <= currentStatusIndex && order.status !== "CANCELLED";
    const isCancelled =
      order.status === "CANCELLED" && step.key === order.status;

    return {
      status: step.label,
      date: timelineEntry
        ? formatDateTime(timelineEntry.createdAt)
        : "অপেক্ষমাণ",
      completed: isCompleted,
      isCancelled,
    };
  });

  // Add cancelled step if order is cancelled
  if (order.status === "CANCELLED") {
    const cancelEntry = order.timeline.find((t) => t.status === "CANCELLED");
    timeline.push({
      status: "বাতিল",
      date: cancelEntry ? formatDateTime(cancelEntry.createdAt) : "",
      completed: true,
      isCancelled: true,
    });
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div>
        <h3 className="font-medium text-foreground mb-4">অর্ডার ট্র্যাকিং</h3>
        <div className="space-y-0">
          {timeline.map((step, index) => (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    step.isCancelled
                      ? "bg-destructive"
                      : step.completed
                        ? "bg-success"
                        : "bg-muted"
                  )}
                />
                {index < timeline.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-8",
                      step.completed ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="pb-4">
                <p
                  className={cn(
                    "font-medium",
                    step.isCancelled
                      ? "text-destructive"
                      : step.completed
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
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
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  x{item.quantity}
                </p>
              </div>
              <p className="font-medium text-foreground">
                ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">সাবটোটাল</span>
          <span className="text-foreground">
            ৳{order.subtotal.toLocaleString("bn-BD")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ডেলিভারি ফি</span>
          <span className="text-foreground">
            ৳{order.deliveryFee.toLocaleString("bn-BD")}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ডিসকাউন্ট</span>
            <span className="text-success">
              -৳{order.discount.toLocaleString("bn-BD")}
            </span>
          </div>
        )}
      </div>

      {/* Address & Payment */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground mb-1">ডেলিভারি ঠিকানা</p>
          <p className="text-sm font-medium text-foreground">
            {order.address.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.address.address}, {order.address.area},{" "}
            {order.address.division}
          </p>
          <p className="text-sm text-muted-foreground">{order.address.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">পেমেন্ট পদ্ধতি</p>
          <p className="text-sm font-medium text-foreground">
            {getPaymentMethodLabel(order.paymentMethod)}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.paymentStatus === "PAID" ? "পেইড" : "আনপেইড"}
          </p>
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
  );
}
