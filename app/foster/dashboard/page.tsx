import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyFosterProfile, getFosterOwnerBookings } from "@/lib/actions/foster-registration";
import { getFosterOwnerBookings as getBookings } from "@/lib/actions/foster-bookings";
import { Navbar } from "@/components/layout/navbar-server";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  PawPrint,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FosterDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/foster/dashboard");
  }

  const [profileResult, bookingsResult] = await Promise.all([
    getMyFosterProfile(),
    getBookings(),
  ]);

  const profile = profileResult.success ? profileResult.data : null;
  const bookings = bookingsResult.success ? bookingsResult.data : [];

  if (!profile) {
    redirect("/foster/register");
  }

  if (profile.status === "PENDING") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 mx-auto text-yellow-600 mb-4" />
                <h1 className="text-2xl font-bold text-yellow-800 mb-4">
                  আপনার আবেদন পর্যালোচনাধীন
                  <br />
                  <span className="text-lg font-normal">Your Application is Under Review</span>
                </h1>
                <p className="text-yellow-700 mb-6">
                  আপনার ফস্টার হোম আবেদন পর্যালোচনা করা হচ্ছে। আমরা যত দ্রুত সম্ভব আপনাকে জানাবো।
                  <br />
                  Your foster home application is being reviewed. We will notify you as soon as possible.
                </p>
                <div className="text-sm text-yellow-600 space-y-2">
                  <p>আবেদনের তারিখ / Application Date: {new Date(profile.createdAt).toLocaleDateString("bn-BD")}</p>
                  <p>ব্যবসার নাম / Business Name: {profile.businessName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profile.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-red-800 mb-4">
                  আপনার আবেদন প্রত্যাখ্যান করা হয়েছে
                  <br />
                  <span className="text-lg font-normal">Your Application was Rejected</span>
                </h1>
                <p className="text-red-700 mb-6">
                  দুঃখিত, আপনার আবেদন প্রত্যাখ্যান করা হয়েছে। দয়া করে আবার আবেদন করার আগে প্রয়োজনীয় তথ্য পর্যালোচনা করুন।
                  <br />
                  Sorry, your application was rejected. Please review the requirements before applying again.
                </p>
                <Button onClick={() => redirect("/foster/register")}>
                  আবার আবেদন করুন / Apply Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeBookings = bookings.filter((b: any) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  );
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.fosterPayout || 0), 0);
  const parsedServices = profile.services ? JSON.parse(profile.services as string) : [];
  const parsedFacilities = profile.facilities ? JSON.parse(profile.facilities as string) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ফস্টার ড্যাশবোর্ড / Foster Dashboard
            </h1>
            <p className="text-muted-foreground">
              {profile.businessName} - {profile.area}, {profile.division}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  চলমান বুকিং / Active Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  সম্পূর্ণ বুকিং / Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedBookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  মোট উপার্জন / Total Earnings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{totalRevenue.toFixed(0)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  রেটিং / Rating
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{profile.rating.toFixed(1)}</span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.reviewCount} রিভিউ / reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>প্রোফাইল তথ্য / Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">ব্যবসার তথ্য / Business Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <PawPrint className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{profile.businessName}</p>
                        <p className="text-muted-foreground">{profile.description}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p>{profile.address}</p>
                        <p className="text-muted-foreground">{profile.area}, {profile.division}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{profile.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{profile.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">ধারণক্ষমতা ও সেবা / Capacity & Services</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ধারণক্ষমতা / Capacity</span>
                      <span className="font-medium">{profile.currentOccupancy}/{profile.maxCapacity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">উপলব্ধ / Available</span>
                      <span className="font-medium text-green-600">
                        {profile.maxCapacity - profile.currentOccupancy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">প্রতি দিনের মূল্য / Daily Price</span>
                      <span className="font-medium">৳{profile.basePricePerDay}</span>
                    </div>
                    <div>
                      <span className="text-sm">স্ট্যাটাস / Status</span>
                      <div className="mt-2">
                        {profile.verified && (
                          <Badge variant="default" className="mr-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant={profile.status === "APPROVED" ? "default" : "secondary"}>
                          {profile.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক বুকিং / Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  এখনো কোনো বুকিং নেই / No bookings yet
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{booking.user.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                          <p className="text-sm mt-2">
                            {new Date(booking.checkIn).toLocaleDateString("bn-BD")} -{" "}
                            {new Date(booking.checkOut).toLocaleDateString("bn-BD")}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            বিড়াল / Cats: {booking.numberOfCats}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              booking.status === "COMPLETED"
                                ? "default"
                                : booking.status === "CONFIRMED"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium mt-2">৳{booking.fosterPayout}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
