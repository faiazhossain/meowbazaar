"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Loader2, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trackOrder } from "@/lib/actions/orders-public";
import { toast } from "sonner";

interface TimelineItem {
  status: string;
  note?: string;
  date: string;
}

interface TrackingData {
  orderNumber: string;
  status: string;
  estimatedDelivery?: string;
  timeline: TimelineItem[];
}

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderNumber.trim()) {
      toast.error("অর্ডার নম্বর লিখুন");
      return;
    }

    setIsLoading(true);
    try {
      const result = await trackOrder(orderNumber.trim());
      if (result.success && result.data) {
        setTrackingData(result.data);
      } else {
        toast.error(result.error || "অর্ডার পাওয়া যায়নি");
      }
    } catch (error) {
      console.error("Track order error:", error);
      toast.error("অর্ডার ট্র্যাক করতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "SHIPPED":
      case "PROCESSING":
      case "CONFIRMED":
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "অপেক্ষমান";
      case "CONFIRMED":
        return "নিশ্চিত";
      case "PROCESSING":
        return "প্রসেসিং হচ্ছে";
      case "SHIPPED":
        return "প্রেরণ";
      case "DELIVERED":
        return "বিতরণ";
      case "CANCELLED":
        return "বাতিল";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "CONFIRMED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavbarClient cartCount={0} wishlistCount={0} user={null} />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">অর্ডার ট্র্যাক করুন</h1>
          <p className="text-muted-foreground">
            আপনার অর্ডার স্ট্যাটাস ট্র্যাক করতে অর্ডার নম্বর দিন
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="অর্ডার নম্বর (উদাহরণ: ORD123456)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleTrack} disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {trackingData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
                      অর্ডার #{trackingData.orderNumber}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {trackingData.estimatedDelivery && (
                        <>
                          প্রত্যাশিত ডেলিভারি:{" "}
                          <span className="font-medium text-foreground">
                            {formatDate(trackingData.estimatedDelivery)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <Badge className={getStatusColor(trackingData.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(trackingData.status)}
                      <span>{getStatusText(trackingData.status)}</span>
                    </div>
                  </Badge>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">অর্ডার টাইমলাইন</h3>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

                    {/* Timeline items */}
                    <div className="space-y-6">
                      {trackingData.timeline.map((item, index) => (
                        <div key={index} className="relative pl-10">
                          {/* Status dot */}
                          <div
                            className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                              index === 0
                                ? "bg-primary border-primary"
                                : "bg-background border-muted-foreground"
                            }`}
                          />

                          {/* Status content */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {getStatusText(item.status)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(item.date)}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-sm text-muted-foreground">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
