import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllFosterProfiles, getFosterStats } from "@/lib/actions/foster-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminFosterPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    division?: string;
    verified?: string;
    page?: string;
  };
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const filters = {
    status: searchParams.status,
    division: searchParams.division,
    verified: searchParams.verified === "true",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  };

  const [fosterProfilesResult, statsResult] = await Promise.all([
    getAllFosterProfiles(filters),
    getFosterStats(),
  ]);

  const fosterProfiles = fosterProfilesResult.success ? fosterProfilesResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;
  const pagination = fosterProfilesResult.success ? fosterProfilesResult.pagination : null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      SUSPENDED: "outline",
    };

    const icons: Record<string, React.ReactNode> = {
      PENDING: <Clock className="h-3 w-3 mr-1" />,
      APPROVED: <CheckCircle className="h-3 w-3 mr-1" />,
      REJECTED: <XCircle className="h-3 w-3 mr-1" />,
      SUSPENDED: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">ফস্টার হোম ব্যবস্থাপনা / Foster Home Management</h1>
          <p className="text-muted-foreground">
            ফস্টার হোম মালিকদের এবং তাদের প্রোফাইল পরিচালনা করুন
            <br />
            Manage foster home owners and their profiles
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  মোট ফস্টার হোম / Total
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  নিবন্ধিত ফস্টার হোম / Registered foster homes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  অনুমোদন অপেক্ষায় / Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  পর্যালোচনার জন্য অপেক্ষমান / Waiting for review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  অনুমোদিত / Approved
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  সক্রিয় ফস্টার হোম / Active foster homes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  যাচাইকৃত / Verified
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
                <p className="text-xs text-muted-foreground">
                  যাচাইকৃত ফস্টার হোম / Verified foster homes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  প্রত্যাখ্যাত / Rejected
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  প্রত্যাখ্যাত আবেদন / Rejected applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  স্থগিত / Suspended
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.suspended}</div>
                <p className="text-xs text-muted-foreground">
                  সাময়িকভাবে স্থগিত / Temporarily suspended
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>ফিল্টার / Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">স্ট্যাটাস / Status</label>
                <Select value={filters.status || "all"} onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams as any);
                  if (value === "all") {
                    params.delete("status");
                  } else {
                    params.set("status", value);
                  }
                  redirect(`/admin/foster?${params.toString()}`);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব / All</SelectItem>
                    <SelectItem value="PENDING">অনুমোদন অপেক্ষায় / Pending</SelectItem>
                    <SelectItem value="APPROVED">অনুমোদিত / Approved</SelectItem>
                    <SelectItem value="REJECTED">প্রত্যাখ্যাত / Rejected</SelectItem>
                    <SelectItem value="SUSPENDED">স্থগিত / Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">যাচাইকরণ / Verification</label>
                <Select value={filters.verified ? "verified" : "all"} onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams as any);
                  if (value === "all") {
                    params.delete("verified");
                  } else {
                    params.set("verified", "true");
                  }
                  redirect(`/admin/foster?${params.toString()}`);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব / All</SelectItem>
                    <SelectItem value="verified">যাচাইকৃত / Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Foster Homes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ফস্টার হোম তালিকা / Foster Homes List</CardTitle>
              {fosterProfiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {pagination?.total || 0} এর মধ্যে {fosterProfiles.length} টি / {fosterProfiles.length} of {pagination?.total || 0}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fosterProfiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  কোনো ফস্টার হোম পাওয়া যায়নি / No Foster Homes Found
                </h3>
                <p className="text-muted-foreground">
                  এই ফিল্টারে কোনো ফস্টার হোম নেই / No foster homes found with these filters
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ফস্টার হোম / Foster Home</TableHead>
                      <TableHead>অবস্থান / Location</TableHead>
                      <TableHead>ধারণক্ষমতা / Capacity</TableHead>
                      <TableHead>রেটিং / Rating</TableHead>
                      <TableHead>স্ট্যাটাস / Status</TableHead>
                      <TableHead>ক্রিয়া / Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fosterProfiles.map((foster: any) => (
                      <TableRow key={foster.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {foster.coverImage ? (
                              <img
                                src={foster.coverImage}
                                alt={foster.businessName}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                <Shield className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {foster.businessName}
                                {foster.verified && (
                                  <Badge variant="secondary" className="ml-2">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {foster.user.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {foster.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {foster.area}, {foster.division}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            {foster.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {foster.currentOccupancy}/{foster.maxCapacity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {foster.maxCapacity - foster.currentOccupancy} উপলব্ধ / Available
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{foster.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({foster.reviewCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(foster.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>ক্রিয়া / Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/foster/${foster.id}`}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  বিস্তারিত দেখুন / View Details
                                </Link>
                              </DropdownMenuItem>
                              {foster.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={async () => {
                                      "use server";
                                      const { updateFosterStatus } = await import("@/lib/actions/foster-admin");
                                      await updateFosterStatus(foster.id, "APPROVED");
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    অনুমোদন করুন / Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={async () => {
                                      "use server";
                                      const { updateFosterStatus } = await import("@/lib/actions/foster-admin");
                                      await updateFosterStatus(foster.id, "REJECTED");
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    প্রত্যাখ্যান করুন / Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {foster.status === "APPROVED" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      "use server";
                                      const { updateFosterStatus } = await import("@/lib/actions/foster-admin");
                                      await updateFosterStatus(foster.id, "SUSPENDED");
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    স্থগিত করুন / Suspend
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      "use server";
                                      const { toggleFosterVerification } = await import("@/lib/actions/foster-admin");
                                      await toggleFosterVerification(foster.id);
                                    }}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {foster.verified ? "যাচাইকরণ সরান" : "যাচাইকরণ দিন"}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {foster.status === "SUSPENDED" && (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={async () => {
                                    "use server";
                                    const { updateFosterStatus } = await import("@/lib/actions/foster-admin");
                                    await updateFosterStatus(foster.id, "APPROVED");
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  পুনরায় সক্ষম করুন / Re-enable
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                  "use server";
                                  const { deleteFosterProfile } = await import("@/lib/actions/foster-admin");
                                  await deleteFosterProfile(foster.id);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                মুছে ফেলুন / Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams as any);
                        params.set("page", (pagination.page - 1).toString());
                        redirect(`/admin/foster?${params.toString()}`);
                      }}
                    >
                      আগে / Previous
                    </Button>
                  )}
                  {pagination.page < pagination.totalPages && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams as any);
                        params.set("page", (pagination.page + 1).toString());
                        redirect(`/admin/foster?${params.toString()}`);
                      }}
                    >
                      পরবর্তী / Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
