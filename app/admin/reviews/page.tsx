"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Search,
  Filter,
  MoreHorizontal,
  Star,
  MessageSquare,
  Trash2,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
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
import {
  getAllReviews,
  adminDeleteReview,
  flagReview,
} from "@/lib/actions/reviews";

const ITEMS_PER_PAGE = 15;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [flaggedFilter, setFlaggedFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<any>(null);

  // View dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewToView, setReviewToView] = useState<any>(null);

  // Reply dialog
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [reviewToReply, setReviewToReply] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const result = await getAllReviews({
        page,
        limit: ITEMS_PER_PAGE,
      });
      setReviews(result.reviews as any[]);
      setTotal(result.total);

      // Filter reviews
      let filtered = result.reviews;

      if (ratingFilter !== "ALL") {
        const rating = parseInt(ratingFilter);
        filtered = filtered.filter((r: any) => r.rating === rating);
      }

      if (flaggedFilter !== "ALL") {
        const isFlagged = flaggedFilter === "true";
        filtered = filtered.filter((r: any) => {
          const isReviewFlagged = r.comment?.startsWith("[FLAGGED] ") ?? false;
          return isReviewFlagged === isFlagged;
        });
      }

      if (search) {
        filtered = filtered.filter((r: any) =>
          r.user.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.user.email?.toLowerCase().includes(search.toLowerCase()) ||
          (r.comment && r.comment.toLowerCase().includes(search.toLowerCase()))
        );
      }

      setReviews(filtered);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("রিভিউ লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, ratingFilter, flaggedFilter]);

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    startTransition(async () => {
      const result = await adminDeleteReview(reviewToDelete.id);
      if (result.success) {
        toast.success("রিভিউ মুছে ফেলা হয়েছে");
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        fetchReviews();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleFlag = async (review: any) => {
    const isFlagged = review.comment?.startsWith("[FLAGGED] ") ?? false;
    startTransition(async () => {
      const result = await flagReview(review.id, !isFlagged);
      if (result.success) {
        toast.success(isFlagged ? "আনফ্ল্যাগ করা হয়েছে" : "ফ্ল্যাগ করা হয়েছে");
        fetchReviews();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleReply = async () => {
    if (!reviewToReply) return;

    // For now, this is a placeholder
    // In production, you'd implement a reply system
    toast.success("রিপ্লাই সেভ করা হয়েছে");
    setReplyDialogOpen(false);
    setReviewToReply(null);
    setReplyText("");
  };

  const isFlagged = (review: any) => {
    return review.comment?.startsWith("[FLAGGED] ") ?? false;
  };

  const getComment = (review: any) => {
    if (review.comment?.startsWith("[FLAGGED] ")) {
      return review.comment.replace("[FLAGGED] ", "");
    }
    return review.comment || "কোন মন্তব্য নেই";
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Calculate stats
  const stats = {
    total: total,
    flagged: reviews.filter((r) => isFlagged(r)).length,
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm">({rating})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">রিভিউ মডারেশন</h1>
        <p className="text-muted-foreground">মোট {total} টি রিভিউ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট রিভিউ</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ফ্ল্যাগড</CardTitle>
            <Flag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">৫ স্টার</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fiveStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">১ স্টার</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.oneStar}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ইউজার বা মন্তব্য দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={ratingFilter}
          onValueChange={(v) => {
            setRatingFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="রেটিং" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব রেটিং</SelectItem>
            <SelectItem value="5">৫ স্টার</SelectItem>
            <SelectItem value="4">৪ স্টার</SelectItem>
            <SelectItem value="3">৩ স্টার</SelectItem>
            <SelectItem value="2">২ স্টার</SelectItem>
            <SelectItem value="1">১ স্টার</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={flaggedFilter}
          onValueChange={(v) => {
            setFlaggedFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="ফ্ল্যাগ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="true">ফ্ল্যাগড</SelectItem>
            <SelectItem value="false">আনফ্ল্যাগড</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">কোন রিভিউ পাওয়া যায়নি</p>
            <p className="text-muted-foreground">
              {search || ratingFilter !== "ALL"
                ? "অন্য ফিল্টার দিয়ে খুঁজুন"
                : "রিভিউ থাকলে এখানে দেখাবে"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পণ্য</TableHead>
                <TableHead>ইউজার</TableHead>
                <TableHead>রেটিং</TableHead>
                <TableHead className="hidden md:table-cell">মন্তব্য</TableHead>
                <TableHead className="hidden md:table-cell">তারিখ</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow
                  key={review.id}
                  className={isFlagged(review) ? "bg-orange-50 dark:bg-orange-950/10" : ""}
                >
                  <TableCell>
                    <Link
                      href={`/products/${review.productId}`}
                      className="font-medium hover:underline"
                    >
                      পণ্য #{review.productId.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.user.name || "নাম নেই"}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-xs">
                      <p className="text-sm line-clamp-2">
                        {getComment(review)}
                      </p>
                      {isFlagged(review) && (
                        <Badge variant="destructive" className="mt-1">
                          <Flag className="mr-1 h-3 w-3" />
                          ফ্ল্যাগড
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), "dd MMM yyyy", {
                        locale: bn,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setReviewToView(review);
                            setViewDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          বিস্তারিত দেখুন
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setReviewToReply(review);
                            setReplyDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          রিপ্লাই করুন
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleFlag(review)}>
                          {isFlagged(review) ? (
                            <>
                              <Flag className="mr-2 h-4 w-4" />
                              আনফ্ল্যাগ করুন
                            </>
                          ) : (
                            <>
                              <Flag className="mr-2 h-4 w-4 fill-current" />
                              ফ্ল্যাগ করুন
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setReviewToDelete(review);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          মুছে ফেলুন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>রিভিউ বিস্তারিত</DialogTitle>
          </DialogHeader>
          {reviewToView && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {reviewToView.user.name || "নাম নেই"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reviewToView.user.email}
                  </p>
                </div>
                {isFlagged(reviewToView) && (
                  <Badge variant="destructive">
                    <Flag className="mr-1 h-3 w-3" />
                    ফ্ল্যাগড
                  </Badge>
                )}
              </div>
              <div>{renderStars(reviewToView.rating)}</div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{getComment(reviewToView)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(reviewToView.createdAt), "dd MMM yyyy, hh:mm a", {
                  locale: bn,
                })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>বন্ধ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>রিপ্লাই দিন</DialogTitle>
            <DialogDescription>
              ইউজারের রিভিউতে রিপ্লাই দিন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewToReply && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">
                    {reviewToReply.user.name || "নাম নেই"}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {reviewToReply.rating} ★
                  </span>
                </div>
                <p className="text-sm">{getComment(reviewToReply)}</p>
              </div>
            )}
            <Textarea
              placeholder="আপনার রিপ্লাই লিখুন..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleReply} disabled={!replyText.trim()}>
              রিপ্লাই পাঠান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>রিভিউ মুছে ফেলুন</DialogTitle>
            <DialogDescription>
              আপনি কি এই রিভিউটি মুছে ফেলতে চান? এটি অপরিবর্তনীয়।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setReviewToDelete(null);
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
