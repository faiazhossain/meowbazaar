"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, LogOut, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { CartButton } from "@/components/cart/cart-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

const navLinks = [
  { href: "/products", label: "সব পণ্য", labelEn: "All Products" },
  { href: "/products?pet=cat", label: "বিড়াল", labelEn: "Cats" },
  { href: "/products?pet=dog", label: "কুকুর", labelEn: "Dogs" },
  { href: "/products?pet=bird", label: "পাখি", labelEn: "Birds" },
  { href: "/products?pet=fish", label: "মাছ", labelEn: "Fish" },
];

interface NavbarClientProps {
  cartCount?: number;
  wishlistCount?: number;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function NavbarClient({
  cartCount = 0,
  wishlistCount = 0,
  user,
}: NavbarClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground min-w-[44px] min-h-[44px]"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-card">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2">
                  <PetLogo />
                  <span className="text-xl font-bold text-primary">
                    PetBazaar
                  </span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="border-t border-border pt-4 space-y-3">
                  {user ? (
                    <>
                      <div className="px-1 mb-2">
                        <p className="font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <SheetClose asChild>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 text-foreground hover:text-primary"
                        >
                          <User className="h-5 w-5" />
                          <span>আমার একাউন্ট</span>
                        </Link>
                      </SheetClose>
                      {isAdmin && (
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 text-foreground hover:text-primary"
                          >
                            <Settings className="h-5 w-5" />
                            <span>অ্যাডমিন প্যানেল</span>
                          </Link>
                        </SheetClose>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-destructive hover:text-destructive/80"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>লগআউট</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/auth/login"
                          className="flex items-center gap-2 text-foreground hover:text-primary"
                        >
                          <User className="h-5 w-5" />
                          <span>লগইন</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/auth/register"
                          className="flex items-center gap-2 text-primary hover:text-brand-orange-dark"
                        >
                          <User className="h-5 w-5" />
                          <span>রেজিস্টার</span>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <PetLogo />
            <span className="text-xl font-bold text-primary hidden sm:inline">
              PetBazaar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 bg-muted border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground min-w-[44px] min-h-[44px]"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto bg-card">
                <form onSubmit={handleSearch} className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="পণ্য খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 bg-muted border-0"
                      autoFocus
                    />
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <WishlistButton serverWishlistCount={wishlistCount} />

            <CartButton serverCartCount={cartCount} />

            {/* User Menu */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground"
                    >
                      <User className="h-5 w-5" />
                      <span className="sr-only">Account menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        আমার একাউন্ট
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        আমার অর্ডার
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            অ্যাডমিন প্যানেল
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      লগআউট
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      লগইন
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-brand-orange-dark text-primary-foreground"
                    >
                      রেজিস্টার
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PetLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      {/* Paw print logo */}
      <circle cx="16" cy="20" r="8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="10" cy="12" r="3" fill="currentColor" />
      <circle cx="22" cy="12" r="3" fill="currentColor" />
      <circle cx="7" cy="18" r="2.5" fill="currentColor" />
      <circle cx="25" cy="18" r="2.5" fill="currentColor" />
      <ellipse cx="16" cy="22" rx="5" ry="4" fill="currentColor" />
    </svg>
  );
}
