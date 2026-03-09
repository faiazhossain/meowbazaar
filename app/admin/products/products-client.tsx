"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteProduct, updateProductStock } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  image: string;
  images: string | null;
  categoryId: string;
  stock: number;
  inStock: boolean;
  isNew: boolean;
  hasCOD: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface ProductsClientProps {
  initialProducts: Product[];
  totalProducts: number;
  categories: Category[];
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  categoryFilter: string;
}

export function ProductsClient({
  initialProducts,
  totalProducts,
  categories,
  currentPage,
  pageSize,
  searchQuery: initialSearch,
  categoryFilter: initialCategory,
}: ProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (value !== "all") params.set("category", value);
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    params.set("page", String(page));
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleDelete = (productId: string) => {
    startTransition(async () => {
      const result = await deleteProduct(productId);

      if (result.success) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success("পণ্য মুছে ফেলা হয়েছে");
      } else {
        toast.error(result.error || "পণ্য মুছে ফেলা যায়নি");
      }
    });
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    startTransition(async () => {
      const result = await updateProductStock(productId, newStock);

      if (result.success) {
        setProducts(
          products.map((p) =>
            p.id === productId
              ? { ...p, stock: newStock, inStock: newStock > 0 }
              : p
          )
        );
        toast.success("স্টক আপডেট হয়েছে");
      } else {
        toast.error(result.error || "স্টক আপডেট করা যায়নি");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            পণ্য ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">মোট {totalProducts} টি পণ্য</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            নতুন পণ্য যোগ করুন
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="ক্যাটাগরি ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category._count.products})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div
        className="bg-card rounded-lg overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  পণ্য
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  ক্যাটাগরি
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  মূল্য
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  স্টক
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  রেটিং
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.nameEn}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <Badge variant="secondary">{product.category.name}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        ৳{product.price.toLocaleString("bn-BD")}
                      </p>
                      {product.mrp && product.mrp > product.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          ৳{product.mrp.toLocaleString("bn-BD")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                          product.stock <= 5
                            ? "bg-destructive/10 text-destructive"
                            : product.stock <= 10
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-success/10 text-success"
                        )}
                      >
                        {product.stock} টি
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="text-foreground">{product.rating}</span>
                      <span className="text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            এডিট করুন
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            দেখুন
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleStockUpdate(product.id, product.stock + 10)
                          }
                        >
                          <Package className="h-4 w-4 mr-2" />
                          +10 স্টক
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              মুছে ফেলুন
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                পণ্য মুছে ফেলতে চান?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{product.name}&quot; মুছে ফেলা হলে এটি আর
                                ফেরত আনা যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                মুছে ফেলুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              কোন পণ্য পাওয়া যায়নি
            </h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== "all"
                ? "ফিল্টার পরিবর্তন করুন"
                : "নতুন পণ্য যোগ করুন"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              পৃষ্ঠা {currentPage} / {totalPages} (মোট {totalProducts} পণ্য)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
