"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  User,
  Menu,
  Home,
  Heart,
  ShoppingBag,
  X,
  Cat,
  PawPrint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { CartButton } from "@/components/cart/cart-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

const navLinks = [
  {
    href: "/products",
    label: "সব পণ্য",
    labelEn: "All Products",
    icon: ShoppingBag,
    count: 156,
  },
  {
    href: "/products?category=food",
    label: "ক্যাট ফুড",
    labelEn: "Cat Food",
    count: 48,
  },
  {
    href: "/products?category=toys",
    label: "খেলনা",
    labelEn: "Toys",
    count: 32,
  },
  {
    href: "/products?category=litter",
    label: "লিটার",
    labelEn: "Litter",
    count: 24,
  },
  {
    href: "/products?category=accessories",
    label: "এক্সেসরিজ",
    labelEn: "Accessories",
    count: 18,
  },
];

const quickLinks = [
  { href: "/", label: "হোম", labelEn: "Home", icon: Home },
  {
    href: "/wishlist",
    label: "পছন্দের তালিকা",
    labelEn: "Wishlist",
    icon: Heart,
  },
  { href: "/cart", label: "কার্ট", labelEn: "Cart", icon: ShoppingBag },
];

const categories = [
  { icon: "🍖", label: "খাবার", color: "bg-orange-100 text-orange-600" },
  { icon: "🧸", label: "খেলনা", color: "bg-amber-100 text-amber-600" },
  { icon: "🏠", label: "লিটার", color: "bg-orange-100 text-orange-600" },
  { icon: "🪑", label: "এক্সেসরিজ", color: "bg-amber-100 text-amber-600" },
];

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === pathname) return true;
    if (href.includes("?") && pathname === "/products") {
      const category = new URLSearchParams(href.split("?")[1]).get("category");
      const currentCategory = new URLSearchParams(window.location.search).get(
        "category"
      );
      return category === currentCategory;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-200/50 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85vw] max-w-[400px] bg-gradient-to-b from-white to-orange-50/30 p-0 border-r border-orange-200/50"
              aria-label="Mobile navigation menu"
            >
              <div className="flex h-full flex-col overflow-y-auto">
                {/* Header with Orange Gradient */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-200/50 bg-gradient-to-r from-orange-50 to-white px-6 py-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
                      <CatLogo />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      PetBazaar
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-orange-100 active:scale-95 text-orange-600"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                {/* User greeting with Orange Theme */}
                <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 px-6 py-5">
                  <p className="text-sm text-white/90 flex items-center gap-1">
                    <span className="text-lg">👋</span> স্বাগতম
                  </p>
                  <p className="font-medium text-white text-lg">
                    আপনার পোষ্যের জন্য খুঁজুন
                  </p>
                  <div className="flex gap-1 mt-2">
                    <PawPrint className="h-4 w-4 text-white/60" />
                    <PawPrint className="h-4 w-4 text-white/80" />
                    <PawPrint className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Quick Links with Orange Theme */}
                <div className="grid grid-cols-3 gap-2 p-4">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={`
                            flex flex-col items-center gap-1.5 rounded-xl p-3 text-center
                            transition-all duration-200
                            ${
                              isActive
                                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 scale-105"
                                : "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:scale-105 active:scale-95 border border-orange-200/50"
                            }
                          `}
                        >
                          <Icon
                            className={`h-5 w-5 ${isActive ? "text-white" : "text-orange-500"}`}
                          />
                          <span className="text-xs font-medium">
                            {link.label}
                          </span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                {/* Category Pills */}
                <div className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${cat.color} border border-orange-200/50`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Navigation with Orange Theme */}
                <div className="flex-1 px-4 py-2">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-orange-600/70 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                    ক্যাটাগরি
                  </h3>
                  <nav
                    className="flex flex-col gap-1"
                    aria-label="Mobile categories"
                  >
                    {navLinks.map((link) => {
                      const isActive = isActiveLink(link.href);

                      return (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className={`
                              group relative flex items-center gap-3 rounded-xl px-4 py-3.5
                              text-[15px] font-medium transition-all duration-200
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
                              active:scale-[0.98]
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-l-4 border-orange-500"
                                  : "text-gray-700 hover:bg-orange-50/80 hover:text-orange-600"
                              }
                            `}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {/* Active indicator */}
                            <span
                              className={`
                                absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full 
                                bg-orange-500 transition-all duration-200
                                ${isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"}
                              `}
                              aria-hidden="true"
                            />

                            {/* Icon if available */}
                            {link.icon && (
                              <link.icon
                                className={`
                                  h-5 w-5 transition-all duration-200
                                  ${isActive ? "text-orange-500" : "text-gray-500 group-hover:text-orange-500"}
                                `}
                                aria-hidden="true"
                              />
                            )}

                            <div className="flex flex-col flex-1">
                              <span>{link.label}</span>
                              <span className="text-xs text-gray-500 group-hover:text-orange-500/70">
                                {link.labelEn}
                              </span>
                            </div>

                            {/* Count badge */}
                            {link.count && (
                              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-600 border border-orange-200">
                                {link.count}
                              </span>
                            )}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>
                </div>

                {/* Promo Banner */}
                <div className="mx-4 my-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                  <p className="text-sm font-medium">🎉 বিশেষ অফার!</p>
                  <p className="text-xs opacity-90">প্রথম অর্ডারে ২০% ছাড়</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 bg-white text-orange-600 hover:bg-orange-50 h-8 text-xs"
                  >
                    এখনই কিনুন
                  </Button>
                </div>

                {/* Account Section */}
                <div className="border-t border-orange-200/50 bg-orange-50/30 px-4 py-4">
                  <SheetClose asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-[0.98] group"
                    >
                      <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <User className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">আমার একাউন্ট</span>
                        <span className="text-xs text-gray-500 group-hover:text-orange-500/70">
                          লগইন / সাইন আপ
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </SheetClose>
                </div>

                {/* Footer */}
                <div className="border-t border-orange-200/50 p-4 text-center text-xs text-gray-500">
                  <p>© 2024 PetBazaar. সর্বস্বত্ব সংরক্ষিত</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative transition-transform group-hover:scale-105 group-active:scale-95">
              <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
              <CatLogo />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent hidden sm:inline">
              PetBazaar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative text-sm font-medium transition-colors py-2
                    ${
                      isActive
                        ? "text-orange-600"
                        : "text-gray-600 hover:text-orange-500"
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-orange-500" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 bg-orange-50/50 border-orange-200/50 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="h-auto bg-white/95 backdrop-blur-md border-b border-orange-200/50"
              >
                <div className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    <Input
                      type="search"
                      placeholder="পণ্য খুঁজুন..."
                      className="w-full pl-10 pr-4 bg-orange-50/50 border-orange-200/50 focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <WishlistButton serverWishlistCount={wishlistCount} />
            <CartButton serverCartCount={cartCount} />

            <Link href="/account" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function CatLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-orange-500 transition-all duration-300 hover:rotate-3 hover:scale-110"
    >
      <path
        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M8 12L6 4L12 8M24 12L26 4L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <circle cx="20" cy="14" r="2" fill="currentColor" />
      <path
        d="M16 18C16 18 14 20 12 20M16 18C16 18 18 20 20 20M16 18V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 22C12 24 14 25 16 25C18 25 20 24 22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
