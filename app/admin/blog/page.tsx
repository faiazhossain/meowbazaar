"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  FileText,
  ChevronLeft,
  ChevronRight,
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
import { toast } from "sonner";
import {
  getAllBlogPosts,
  deleteBlogPost,
  updateBlogPost,
} from "@/lib/actions/blog";

const ITEMS_PER_PAGE = 15;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [petTypeFilter, setPetTypeFilter] = useState("ALL");
  const [publishedFilter, setPublishedFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const result = await getAllBlogPosts({
        page,
        limit: ITEMS_PER_PAGE,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        petType: petTypeFilter !== "ALL" ? petTypeFilter : undefined,
        published: publishedFilter !== "ALL" ? publishedFilter === "true" : undefined,
      });
      setPosts(result.posts as any[]);
      setTotal(result.total);

      // Filter posts by search
      if (search) {
        const filtered = result.posts.filter((post: any) =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.titleEn.toLowerCase().includes(search.toLowerCase()) ||
          post.slug.toLowerCase().includes(search.toLowerCase())
        );
        setPosts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
      toast.error("ব্লগ পোস্ট লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, categoryFilter, petTypeFilter, publishedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async () => {
    if (!postToDelete) return;

    startTransition(async () => {
      const result = await deleteBlogPost(postToDelete.id);
      if (result.success) {
        toast.success("ব্লগ পোস্ট মুছে ফেলা হয়েছে");
        setDeleteDialogOpen(false);
        setPostToDelete(null);
        fetchPosts();
      } else {
        toast.error(result.error);
      }
    });
  };

  const toggleFeatured = async (post: any) => {
    startTransition(async () => {
      const result = await updateBlogPost(post.id, {
        featured: !post.featured,
      });
      if (result.success) {
        toast.success(post.featured ? "ফিচার্ড বন্ধ করা হয়েছে" : "ফিচার্ড করা হয়েছে");
        fetchPosts();
      } else {
        toast.error(result.error);
      }
    });
  };

  const togglePublished = async (post: any) => {
    startTransition(async () => {
      const result = await updateBlogPost(post.id, {
        published: !post.published,
      });
      if (result.success) {
        toast.success(post.published ? "আনপাবলিশ করা হয়েছে" : "পাবলিশ করা হয়েছে");
        fetchPosts();
      } else {
        toast.error(result.error);
      }
    });
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Calculate stats
  const stats = {
    total: total,
    published: posts.filter((p) => p.published).length,
    draft: posts.filter((p) => !p.published).length,
    featured: posts.filter((p) => p.featured).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ব্লগ ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">মোট {total} টি ব্লগ পোস্ট</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            নতুন পোস্ট
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পোস্ট</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পাবলিশড</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ড্রাফট</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ফিচার্ড</CardTitle>
            <Star className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="শিরোনাম বা স্লাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব ক্যাটাগরি</SelectItem>
            <SelectItem value="পোষা প্রাণীর যত্ন">পোষা প্রাণীর যত্ন</SelectItem>
            <SelectItem value="খাদ্য ও পুষ্টি">খাদ্য ও পুষ্টি</SelectItem>
            <SelectItem value="স্বাস্থ্য ও রোগ">স্বাস্থ্য ও রোগ</SelectItem>
            <SelectItem value="প্রশিক্ষণ">প্রশিক্ষণ</SelectItem>
            <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={petTypeFilter}
          onValueChange={(v) => {
            setPetTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="পেট টাইপ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব পেট</SelectItem>
            <SelectItem value="cat">বিড়াল</SelectItem>
            <SelectItem value="dog">কুকুর</SelectItem>
            <SelectItem value="bird">পাখি</SelectItem>
            <SelectItem value="fish">মাছ</SelectItem>
            <SelectItem value="other">অন্যান্য</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={publishedFilter}
          onValueChange={(v) => {
            setPublishedFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="true">পাবলিশড</SelectItem>
            <SelectItem value="false">ড্রাফট</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">কোন ব্লগ পোস্ট পাওয়া যায়নি</p>
            <p className="text-muted-foreground">
              {search || categoryFilter !== "ALL"
                ? "অন্য ফিল্টার দিয়ে খুঁজুন"
                : "প্রথম ব্লগ পোস্ট তৈরি করুন"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পোস্ট</TableHead>
                <TableHead className="hidden md:table-cell">ক্যাটাগরি</TableHead>
                <TableHead className="hidden md:table-cell">পেট</TableHead>
                <TableHead className="hidden md:table-cell">ভিউ</TableHead>
                <TableHead className="hidden md:table-cell">তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <img
                        src={post.image || "/placeholder.jpg"}
                        alt={post.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.slug}
                        </p>
                        {post.featured && (
                          <Badge variant="secondary" className="mt-1">
                            <Star className="mr-1 h-3 w-3" />
                            ফিচার্ড
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{post.petType}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.viewCount || 0}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "dd MMM yyyy", {
                        locale: bn,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "পাবলিশড" : "ড্রাফট"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.slugEn || post.slug}`} target="_blank">
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
                            <Link href={`/admin/blog/${post.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              এডিট করুন
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => togglePublished(post)}>
                            {post.published ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                আনপাবলিশ করুন
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                পাবলিশ করুন
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(post)}>
                            {post.featured ? (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                আনফিচার করুন
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4 fill-current" />
                                ফিচার করুন
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setPostToDelete(post);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            মুছে ফেলুন
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ব্লগ পোস্ট মুছে ফেলুন</DialogTitle>
            <DialogDescription>
              আপনি কি &quot;{postToDelete?.title}&quot; ব্লগ পোস্টটি মুছে ফেলতে চান? এটি অপরিবর্তনীয়।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPostToDelete(null);
              }}
            >
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
