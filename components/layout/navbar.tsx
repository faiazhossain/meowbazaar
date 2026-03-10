"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, Menu } from "lucide-react";
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
  { href: "/products", label: "সব পণ্য", labelEn: "All Products" },
  { href: "/products?category=food", label: "ক্যাট ফুড", labelEn: "Cat Food" },
  { href: "/products?category=toys", label: "খেলনা", labelEn: "Toys" },
  { href: "/products?category=litter", label: "লিটার", labelEn: "Litter" },
  {
    href: "/products?category=accessories",
    label: "এক্সেসরিজ",
    labelEn: "Accessories",
  },
];

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-card">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2">
                  <CatLogo />
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
                <div className="border-t border-border pt-4">
                  <SheetClose asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 text-foreground hover:text-primary"
                    >
                      <User className="h-5 w-5" />
                      <span>আমার একাউন্ট</span>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <CatLogo />
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
          <div className="hidden md:flex flex-1 max-w-md mx-4">
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
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto bg-card">
                <div className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="পণ্য খুঁজুন..."
                      className="w-full pl-10 pr-4 bg-muted border-0"
                      autoFocus
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <WishlistButton serverWishlistCount={wishlistCount} />

            <CartButton serverCartCount={cartCount} />

            <Link href="/account" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="text-foreground">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
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
      className="text-primary"
    >
      <path
        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
        fill="currentColor"
        fillOpacity="0.2"
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
