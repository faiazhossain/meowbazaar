import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/product-badges";
import { getProfile } from "@/lib/actions/profile";
import { getOrders } from "@/lib/actions/orders";
import { auth } from "@/lib/auth";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMemberSince(date: Date): string {
  return new Date(date).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
  });
}

export default async function AccountDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account");
  }

  // Redirect admins to admin dashboard
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const [profile, orders] = await Promise.all([getProfile(), getOrders()]);

  if (!profile) {
    redirect("/auth/login?callbackUrl=/account");
  }

  const recentOrders = orders.slice(0, 3);
  const orderCount = profile._count?.orders ?? 0;
  const wishlistCount = profile._count?.wishlist ?? 0;
  const addressCount = profile._count?.addresses ?? 0;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>
          স্বাগতম, {profile.name || "ব্যবহারকারী"}!
        </h1>
        <p className='text-muted-foreground'>আপনার একাউন্ট ড্যাশবোর্ড</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div
          className='bg-card rounded-lg p-6'
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
              <Package className='h-6 w-6 text-primary' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {orderCount.toLocaleString("bn-BD")}
              </p>
              <p className='text-sm text-muted-foreground'>মোট অর্ডার</p>
            </div>
          </div>
        </div>
        <div
          className='bg-card rounded-lg p-6'
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center'>
              <Heart className='h-6 w-6 text-accent' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {wishlistCount.toLocaleString("bn-BD")}
              </p>
              <p className='text-sm text-muted-foreground'>উইশলিস্ট</p>
            </div>
          </div>
        </div>
        <div
          className='bg-card rounded-lg p-6'
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-full bg-success/10 flex items-center justify-center'>
              <MapPin className='h-6 w-6 text-success' />
            </div>
            <div>
              <p className='text-2xl font-bold text-foreground'>
                {addressCount.toLocaleString("bn-BD")}
              </p>
              <p className='text-sm text-muted-foreground'>সেভড ঠিকানা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className='bg-card rounded-lg p-6'
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground'>
            সাম্প্রতিক অর্ডার
          </h2>
          {orderCount > 0 && (
            <Link
              href='/account/orders'
              className='text-sm text-primary hover:text-brand-orange-dark flex items-center gap-1'
            >
              সব দেখুন <ChevronRight className='h-4 w-4' />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center'>
              <ShoppingBag className='h-8 w-8 text-muted-foreground' />
            </div>
            <p className='text-muted-foreground mb-4'>কোনো অর্ডার নেই</p>
            <Link href='/products'>
              <Button size='sm'>শপিং শুরু করুন</Button>
            </Link>
          </div>
        ) : (
          <div className='space-y-4'>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className='flex items-center justify-between p-4 bg-muted rounded-lg'
              >
                <div>
                  <p className='font-medium text-foreground'>
                    {order.orderNumber}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-foreground'>
                    ৳{order.total.toLocaleString("bn-BD")}
                  </p>
                  <OrderStatusBadge
                    status={
                      order.status.toLowerCase() as
                        | "pending"
                        | "confirmed"
                        | "processing"
                        | "shipped"
                        | "delivered"
                        | "cancelled"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div
        className='bg-card rounded-lg p-6'
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground'>
            একাউন্ট তথ্য
          </h2>
          <Link href='/account/profile'>
            <Button variant='outline' size='sm'>
              এডিট করুন
            </Button>
          </Link>
        </div>
        <div className='grid sm:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-muted-foreground'>নাম</p>
            <p className='font-medium text-foreground'>{profile.name || "-"}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>ফোন</p>
            <p className='font-medium text-foreground'>
              {profile.phone || "-"}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>ইমেইল</p>
            <p className='font-medium text-foreground'>
              {profile.email || "-"}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>মেম্বার সিন্স</p>
            <p className='font-medium text-foreground'>
              {formatMemberSince(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
