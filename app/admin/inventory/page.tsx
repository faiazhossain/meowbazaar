"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
  Save,
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  updateProductStock,
  getLowStockProducts,
  getInventoryOverview,
  adjustStock,
} from "@/lib/actions/admin";

const ITEMS_PER_PAGE = 20;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Stock adjustment dialog
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  // Quick stock update
  const [quickUpdateId, setQuickUpdateId] = useState<string | null>(null);
  const [quickStockValue, setQuickStockValue] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let resultProducts;

      if (stockFilter === "LOW") {
        resultProducts = await getLowStockProducts();
        setProducts(resultProducts);
        setTotal(resultProducts.length);
      } else {
        // For now, we'll just fetch low stock for demo
        // In production, you'd add a getInventoryProducts function
        resultProducts = await getLowStockProducts();
        setProducts(resultProducts);
        setTotal(resultProducts.length);
      }

      // Filter by search and category
      if (search || categoryFilter !== "ALL") {
        let filtered = resultProducts;

        if (search) {
          filtered = filtered.filter((p: any) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (categoryFilter !== "ALL") {
          filtered = filtered.filter((p: any) => p.category.name === categoryFilter);
        }

        setProducts(filtered);
        setTotal(filtered.length);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("ইনভেন্টরি লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getInventoryOverview();
      setStats(result);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [page, stockFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleQuickUpdate = async (productId: string) => {
    const stock = parseInt(quickStockValue);
    if (isNaN(stock) || stock < 0) {
      toast.error("সঠিক স্টক পরিমাণ দিন");
      return;
    }

    startTransition(async () => {
      const result = await updateProductStock(productId, stock);
      if (result.success) {
        toast.success("স্টক আপডেট হয়েছে");
        setQuickUpdateId(null);
        setQuickStockValue("");
        fetchProducts();
        fetchStats();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleAdjustStock = async () => {
    if (!productToAdjust || !adjustmentAmount) return;

    const adjustment = adjustmentType === "add" ? adjustmentAmount : -adjustmentAmount;

    startTransition(async () => {
      const result = await adjustStock(
        productToAdjust.id,
        adjustment,
        adjustmentReason || "স্টক সমন্বয়"
      );
      if (result.success) {
        toast.success("স্টক সমন্বয় হয়েছে");
        setAdjustDialogOpen(false);
        setProductToAdjust(null);
        setAdjustmentAmount(1);
        setAdjustmentReason("");
        fetchProducts();
        fetchStats();
      } else {
        toast.error(result.error);
      }
    });
  };

  const openAdjustDialog = (product: any, type: "add" | "remove") => {
    setProductToAdjust(product);
    setAdjustmentType(type);
    setAdjustmentAmount(1);
    setAdjustmentReason("");
    setAdjustDialogOpen(true);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "শেষ", variant: "destructive" as const, icon: AlertCircle };
    if (stock <= 5) return { label: "খুব কম", variant: "destructive" as const, icon: AlertTriangle };
    if (stock <= 10) return { label: "কম", variant: "secondary" as const, icon: TrendingDown };
    return { label: "ঠিক আছে", variant: "default" as const, icon: CheckCircle };
  };

  const isLowStock = (stock: number) => {
    return stock <= 10;
  };

  const categories = stats.categories || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ইনভেন্টরি ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">মোট {stats.totalProducts} টি পণ্য</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">স্টক আছে</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কম স্টক</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">স্টক শেষ</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="পণ্য দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={stockFilter}
          onValueChange={(v) => {
            setStockFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="স্টক স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব পণ্য</SelectItem>
            <SelectItem value="LOW">কম স্টক</SelectItem>
            <SelectItem value="OUT">স্টক শেষ</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব ক্যাটাগরি</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name} ({cat._count.products})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { fetchProducts(); fetchStats(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">কোন পণ্য পাওয়া যায়নি</p>
            <p className="text-muted-foreground">
              {search || categoryFilter !== "ALL"
                ? "অন্য ফিল্টার দিয়ে খুঁজুন"
                : "পণ্য থাকলে এখানে দেখাবে"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পণ্য</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>মূল্য</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const StatusIcon = stockStatus.icon;

                return (
                  <TableRow
                    key={product.id}
                    className={isLowStock(product.stock) ? "bg-orange-50 dark:bg-orange-950/10" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "/placeholder.jpg"}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium hover:underline"
                            target="_blank"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category?.name || "-"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ৳{product.price.toLocaleString("bn-BD")}
                    </TableCell>
                    <TableCell>
                      {quickUpdateId === product.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={quickStockValue}
                            onChange={(e) => setQuickStockValue(e.target.value)}
                            className="w-20"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleQuickUpdate(product.id)}
                            disabled={isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setQuickUpdateId(null);
                              setQuickStockValue("");
                            }}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={`font-medium cursor-pointer hover:underline ${
                            isLowStock(product.stock) ? "text-orange-600" : ""
                          }`}
                          onClick={() => {
                            setQuickUpdateId(product.id);
                            setQuickStockValue(product.stock.toString());
                          }}
                        >
                          {product.stock}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stockStatus.variant}
                        className="gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAdjustDialog(product, "add")}
                          title="স্টক যোগ করুন"
                        >
                          <Plus className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAdjustDialog(product, "remove")}
                          title="স্টক কমান"
                          disabled={product.stock <= 0}
                        >
                          <Minus className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Link>
                        </Button>
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>স্টক সমন্বয় করুন</DialogTitle>
            <DialogDescription>
              {productToAdjust?.name} এর স্টক পরিবর্তন করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">বর্তমান স্টক:</span>
              <span className="text-2xl font-bold">{productToAdjust?.stock}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">সমন্বয়ের ধরন</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  যোগ করুন
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "remove" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("remove")}
                  className="flex-1"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  কমান
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">পরিমাণ</label>
              <Input
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">কারণ (ঐচ্ছিক)</label>
              <Textarea
                placeholder="স্টক সমন্বয়ের কারণ লিখুন..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                rows={2}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                নতুন স্টক:{" "}
                <span className="font-bold text-lg ml-2">
                  {productToAdjust?.stock || 0}
                  {adjustmentType === "add" ? "+" : "-"}
                  {adjustmentAmount} ={" "}
                  {(productToAdjust?.stock || 0) +
                    (adjustmentType === "add" ? 1 : -1) * adjustmentAmount}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={isPending || !adjustmentAmount}
            >
              {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              <Save className="mr-2 h-4 w-4" />
              সমন্বয় করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
