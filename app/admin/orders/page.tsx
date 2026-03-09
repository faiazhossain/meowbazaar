"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Package,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getOrders, updateOrderStatus } from "@/lib/actions/admin";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
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
  }
> = {
  PENDING: { label: "পেন্ডিং", variant: "secondary", icon: Clock },
  CONFIRMED: { label: "কনফার্মড", variant: "default", icon: CheckCircle },
  PROCESSING: { label: "প্রসেসিং", variant: "outline", icon: RefreshCw },
  SHIPPED: { label: "শিপড", variant: "outline", icon: Truck },
  DELIVERED: { label: "ডেলিভারড", variant: "default", icon: Package },
  CANCELLED: { label: "বাতিল", variant: "destructive", icon: XCircle },
};

const ITEMS_PER_PAGE = 15;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Status update dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const result = await getOrders({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
      });
      setOrders(result.orders as Order[]);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    startTransition(async () => {
      const result = await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNote || undefined
      );
      if (result.success) {
        toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে");
        setIsDialogOpen(false);
        setSelectedOrder(null);
        setNewStatus("");
        setStatusNote("");
        fetchOrders();
      } else {
        toast.error(result.error);
      }
    });
  };

  const openStatusDialog = (order: Order, status: OrderStatus) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter(
      (o) => o.status === "CONFIRMED" || o.status === "PROCESSING"
    ).length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">মোট {total} টি অর্ডার</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer hover:border-primary/50"
          onClick={() => setStatusFilter("PENDING")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পেন্ডিং</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50"
          onClick={() => setStatusFilter("CONFIRMED")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">প্রসেসিং</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50"
          onClick={() => setStatusFilter("SHIPPED")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">শিপড</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50"
          onClick={() => setStatusFilter("DELIVERED")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ডেলিভারড</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="অর্ডার নম্বর বা কাস্টমার দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="PENDING">পেন্ডিং</SelectItem>
            <SelectItem value="CONFIRMED">কনফার্মড</SelectItem>
            <SelectItem value="PROCESSING">প্রসেসিং</SelectItem>
            <SelectItem value="SHIPPED">শিপড</SelectItem>
            <SelectItem value="DELIVERED">ডেলিভারড</SelectItem>
            <SelectItem value="CANCELLED">বাতিল</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">কোন অর্ডার পাওয়া যায়নি</p>
            <p className="text-muted-foreground">
              {search || statusFilter !== "ALL"
                ? "অন্য ফিল্টার দিয়ে খুঁজুন"
                : "অর্ডার হলে এখানে দেখাবে"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>অর্ডার</TableHead>
                <TableHead>কাস্টমার</TableHead>
                <TableHead className="hidden md:table-cell">তারিখ</TableHead>
                <TableHead>আইটেম</TableHead>
                <TableHead>মোট</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon =
                  ORDER_STATUS_CONFIG[order.status]?.icon || Clock;
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.paymentMethod} •{" "}
                          {order.paymentStatus === "PAID" ? "পেইড" : "আনপেইড"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.user.name || "নাম নেই"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.user.phone || order.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground">
                        {format(new Date(order.createdAt), "dd MMM yyyy", {
                          locale: bn,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>{order.items.length} টি</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ORDER_STATUS_CONFIG[order.status]?.variant ||
                          "secondary"
                        }
                        className="gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {ORDER_STATUS_CONFIG[order.status]?.label ||
                          order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                বিস্তারিত দেখুন
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusDialog(order, "CONFIRMED")
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                কনফার্ম করুন
                              </DropdownMenuItem>
                            )}
                            {(order.status === "CONFIRMED" ||
                              order.status === "PROCESSING") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusDialog(order, "SHIPPED")
                                }
                              >
                                <Truck className="mr-2 h-4 w-4 text-blue-500" />
                                শিপ করুন
                              </DropdownMenuItem>
                            )}
                            {order.status === "SHIPPED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusDialog(order, "DELIVERED")
                                }
                              >
                                <Package className="mr-2 h-4 w-4 text-green-500" />
                                ডেলিভারড
                              </DropdownMenuItem>
                            )}
                            {order.status !== "DELIVERED" &&
                              order.status !== "CANCELLED" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      openStatusDialog(order, "CANCELLED")
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    বাতিল করুন
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(page * ITEMS_PER_PAGE, total)} / {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              আগে
            </Button>
            <span className="text-sm">
              পৃষ্ঠা {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              পরে
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>অর্ডার স্ট্যাটাস আপডেট</DialogTitle>
            <DialogDescription>
              অর্ডার #{selectedOrder?.orderNumber} এর স্ট্যাটাস পরিবর্তন করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">বর্তমান:</span>
              <Badge
                variant={
                  ORDER_STATUS_CONFIG[selectedOrder?.status as OrderStatus]
                    ?.variant || "secondary"
                }
              >
                {ORDER_STATUS_CONFIG[selectedOrder?.status as OrderStatus]
                  ?.label || selectedOrder?.status}
              </Badge>
              <span className="mx-2">→</span>
              <Badge
                variant={
                  ORDER_STATUS_CONFIG[newStatus as OrderStatus]?.variant ||
                  "secondary"
                }
              >
                {ORDER_STATUS_CONFIG[newStatus as OrderStatus]?.label ||
                  newStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">নোট (ঐচ্ছিক)</label>
              <Textarea
                placeholder="স্ট্যাটাস পরিবর্তনের কারণ লিখুন..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isPending}>
              {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
