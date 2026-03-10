"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Package,
  AlertCircle,
  Info,
  Megaphone,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAllNotifications,
  getNotificationsStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  AdminNotification,
} from "@/lib/actions/notifications";
import { pusherClient, ADMIN_NOTIFICATIONS_CHANNEL, NEW_ORDER_EVENT } from "@/lib/pusher-client";

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

interface NewOrderPayload {
  id: string;
  orderId: string;
  orderNumber: string;
  type: "NEW_ORDER";
  title: string;
  message: string;
  total: number;
  customerName: string;
  createdAt: string;
}

const NOTIFICATION_TYPES = [
  { value: "ALL", label: "সব ধরন", icon: Bell },
  { value: "NEW_ORDER", label: "নতুন অর্ডার", icon: Package },
  { value: "SYSTEM", label: "সিস্টেম", icon: Info },
  { value: "ALERT", label: "এলার্ট", icon: AlertCircle },
  { value: "PROMO", label: "প্রমোশন", icon: Megaphone },
];

const ITEMS_PER_PAGE = 20;

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return "এখনই";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} মিনিট আগে`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ঘন্টা আগে`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} দিন আগে`;
  return format(new Date(date), "dd MMM yyyy", { locale: bn });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "NEW_ORDER":
      return { icon: Package, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" };
    case "SYSTEM":
      return { icon: Info, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" };
    case "ALERT":
      return { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" };
    case "PROMO":
      return { icon: Megaphone, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" };
    default:
      return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30" };
  }
}

function groupNotificationsByDate(notifications: AdminNotification[]) {
  const groups: { [key: string]: AdminNotification[] } = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);

    let groupKey: string;
    if (isToday(date)) {
      groupKey = "আজ";
    } else if (isYesterday(date)) {
      groupKey = "গতকাল";
    } else if (isThisWeek(date)) {
      groupKey = "এই সপ্তাহ";
    } else if (isThisMonth(date)) {
      groupKey = "এই মাস";
    } else {
      groupKey = format(date, "MMMM yyyy", { locale: bn });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
}

export default function AdminNotificationPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, today: 0, thisWeek: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<AdminNotification | null>(null);
  const [clearReadDialogOpen, setClearReadDialogOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const result = await getNotificationsStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllNotifications({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        unreadOnly: readFilter === "UNREAD",
        type: typeFilter,
      });

      let filteredNotifications = result.notifications as AdminNotification[];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredNotifications = filteredNotifications.filter(
          (n) =>
            n.title.toLowerCase().includes(query) ||
            n.message.toLowerCase().includes(query)
        );
      }

      setNotifications(filteredNotifications);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("নোটিফিকেশন লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, readFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    const channel = pusherClient.subscribe(ADMIN_NOTIFICATIONS_CHANNEL);

    const handleNewOrder = (data: NewOrderPayload) => {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(console.error);

      const newNotification: AdminNotification = {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        metadata: JSON.stringify({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          total: data.total,
          customerName: data.customerName,
        }),
        createdAt: new Date(data.createdAt),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        today: prev.today + 1,
        thisWeek: prev.thisWeek + 1,
      }));
      setTotal((prev) => prev + 1);
    };

    channel.bind(NEW_ORDER_EVENT, handleNewOrder);

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(ADMIN_NOTIFICATIONS_CHANNEL);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        toast.success("নোটিফিকেশন পড়া হিসাবে চিহ্নিত");
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setStats((prev) => ({ ...prev, unread: 0 }));
        toast.success("সব নোটিফিকেশন পড়া হিসাবে চিহ্নিত");
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }
    });
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;

    startTransition(async () => {
      const result = await deleteNotification(notificationToDelete.id);
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          unread: notificationToDelete.isRead ? prev.unread : Math.max(0, prev.unread - 1),
        }));
        toast.success("নোটিফিকেশন মুছে ফেলা হয়েছে");
        setDeleteDialogOpen(false);
        setNotificationToDelete(null);
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }
    });
  };

  const handleClearRead = async () => {
    startTransition(async () => {
      const result = await deleteAllReadNotifications();
      if (result.success) {
        const deletedCount = result.count ?? 0;
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        setTotal((prev) => Math.max(0, prev - deletedCount));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - deletedCount),
        }));
        toast.success(`${deletedCount} টি পড়া নোটিফিকেশন মুছে ফেলা হয়েছে`);
        setClearReadDialogOpen(false);
        fetchStats();
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }
    });
  };

  const getNotificationLink = (notification: AdminNotification): string => {
    if (notification.type === "NEW_ORDER") {
      try {
        const metadata = JSON.parse(notification.metadata || "{}");
        return `/admin/orders/${metadata.orderId}`;
      } catch {
        return "/admin/orders";
      }
    }
    return "/admin";
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">নোটিফিকেশন</h1>
          <p className="text-muted-foreground">মোট {total} টি নোটিফিকেশন</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={isPending}>
              <CheckCheck className="h-4 w-4 mr-2" />
              সব পড়া হিসাবে চিহ্নিত
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearReadDialogOpen(true)}
            disabled={isPending || stats.total === stats.unread}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            পড়া মুছুন
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            readFilter === "UNREAD" && "border-primary"
          )}
          onClick={() => setReadFilter(readFilter === "UNREAD" ? "ALL" : "UNREAD")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপঠিত</CardTitle>
            <BellOff className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.unread}</div>
            )}
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setTypeFilter("ALL")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">আজ</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.today}</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">এই সপ্তাহ</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="নোটিফিকেশন খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="ধরন ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব</SelectItem>
            <SelectItem value="UNREAD">অপঠিত</SelectItem>
            <SelectItem value="READ">পঠিত</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">কোন নোটিফিকেশন নেই</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {searchQuery || typeFilter !== "ALL" || readFilter !== "ALL"
                ? "অন্য ফিল্টার দিয়ে খুঁজুন"
                : "নতুন নোটিফিকেশন এলে এখানে দেখাবে"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-480px)] min-h-[400px]">
            {Object.entries(groupedNotifications).map(([group, items], groupIndex) => (
              <div key={group}>
                {groupIndex > 0 && <Separator />}
                <div className="px-4 py-2 bg-muted/50 sticky top-0 z-10">
                  <span className="text-sm font-medium text-muted-foreground">{group}</span>
                </div>
                <div className="divide-y">
                  {items.map((notification) => {
                    const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                    const metadata = notification.metadata
                      ? JSON.parse(notification.metadata)
                      : null;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors group",
                          !notification.isRead && "bg-primary/5"
                        )}
                      >
                        <Link
                          href={getNotificationLink(notification)}
                          className="flex items-start gap-4 flex-1 min-w-0"
                        >
                          <div
                            className={cn(
                              "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                              bg
                            )}
                          >
                            <Icon className={cn("h-5 w-5", color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={cn(
                                  "font-medium truncate",
                                  !notification.isRead && "text-foreground"
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              {metadata?.total && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(metadata.total)}
                                  </span>
                                </>
                              )}
                              {metadata?.customerName && (
                                <>
                                  <span>•</span>
                                  <span>{metadata.customerName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.isRead && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  পড়া হিসাবে চিহ্নিত
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={getNotificationLink(notification)}>
                                  <Package className="mr-2 h-4 w-4" />
                                  বিস্তারিত দেখুন
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setNotificationToDelete(notification);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                মুছে ফেলুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} / {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              আগে
            </Button>
            <span className="text-sm min-w-[80px] text-center">
              পৃষ্ঠা {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              পরে
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নোটিফিকেশন মুছে ফেলুন</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে এই নোটিফিকেশন মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Read Dialog */}
      <Dialog open={clearReadDialogOpen} onOpenChange={setClearReadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>পঠিত নোটিফিকেশন মুছে ফেলুন</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে সব পঠিত নোটিফিকেশন মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearReadDialogOpen(false)}>
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleClearRead} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
