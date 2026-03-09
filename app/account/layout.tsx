"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Footer } from "@/components/layout/footer";
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Heart,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { href: "/account", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/account/orders", label: "আমার অর্ডার", icon: Package },
  { href: "/account/profile", label: "প্রোফাইল", icon: User },
  { href: "/account/addresses", label: "ঠিকানা", icon: MapPin },
  { href: "/account/wishlist", label: "উইশলিস্ট", icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const SidebarContent = () => (
    <nav className="space-y-1">
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">লগআউট</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <NavbarClient
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        user={user}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-4 right-4 z-50 shadow-lg"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card">
              <div className="py-6">
                <h2 className="text-lg font-semibold text-foreground mb-6 px-4">
                  আমার একাউন্ট
                </h2>
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div
              className="sticky top-24 bg-card rounded-lg p-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 px-4">
                আমার একাউন্ট
              </h2>
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
