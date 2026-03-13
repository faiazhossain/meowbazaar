"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  Menu,
  LogOut,
  Settings,
  Package,
  Home,
  Heart,
  ShoppingBag,
  X,
  ChevronRight,
  PawPrint,
  Star,
} from "lucide-react";
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
import {
  LanguageToggle,
  LanguageToggleMobile,
} from "@/components/ui/language-toggle";
import { useTranslation } from "@/lib/i18n/use-translation";

const navLinks = [
  {
    href: "/products",
    label: "সব পণ্য",
    labelEn: "All Products",
    icon: ShoppingBag,
    count: 156,
  },
  {
    href: "/products?pet=cat",
    label: "বিড়াল",
    labelEn: "Cats",
    icon: "🐱",
    count: 48,
  },
  {
    href: "/products?pet=dog",
    label: "কুকুর",
    labelEn: "Dogs",
    icon: "🐶",
    count: 52,
  },
  {
    href: "/products?pet=bird",
    label: "পাখি",
    labelEn: "Birds",
    icon: "🐦",
    count: 24,
  },
  {
    href: "/products?pet=fish",
    label: "মাছ",
    labelEn: "Fish",
    icon: "🐠",
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

const petCategories = [
  {
    icon: "🐱",
    label: "বিড়াল",
    labelEn: "Cat",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: "🐶",
    label: "কুকুর",
    labelEn: "Dog",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: "🐦",
    label: "পাখি",
    labelEn: "Bird",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: "🐠",
    label: "মাছ",
    labelEn: "Fish",
    color: "bg-amber-100 text-amber-700",
  },
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
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isAdmin = user?.role === "ADMIN";

  const isActiveLink = (href: string) => {
    if (href === pathname) return true;
    if (href.includes("?") && pathname === "/products") {
      const pet = new URLSearchParams(href.split("?")[1]).get("pet");
      const currentPet = new URLSearchParams(window.location.search).get("pet");
      return pet === currentPet;
    }
    return false;
  };

  const getNavLabel = (link: (typeof navLinks)[0]) => {
    return locale === "en" ? link.labelEn : link.label;
  };

  const getQuickLinkLabel = (link: (typeof quickLinks)[0]) => {
    return locale === "en" ? link.labelEn : link.label;
  };

  const getPetCategoryLabel = (cat: (typeof petCategories)[0]) => {
    return locale === "en" ? cat.labelEn : cat.label;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-200 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <div className="flex justify-start">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-600 hover:bg-orange-100 hover:text-orange-700 active:scale-95 transition-all min-w-[44px] min-h-[44px]"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85vw] max-w-[400px] bg-white p-0 border-r border-orange-200"
                aria-label="Mobile navigation menu"
              >
                <div className="flex h-full flex-col overflow-y-auto">
                  {/* Header with Solid Orange Background */}
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-200 bg-orange-50 px-6 py-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="relative">
                        <PetLogo />
                      </div>
                      <span className="text-xl font-bold text-orange-600">
                        PetBazaar
                      </span>
                    </Link>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-orange-200 active:scale-95 text-orange-600"
                        aria-label="Close menu"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* User greeting with Solid Orange Background */}
                  <div className="bg-orange-500 px-6 py-5">
                    <p className="text-sm text-white flex items-center gap-1">
                      <span className="text-lg">👋</span>
                      {user
                        ? t("mobileMenu.welcomeUser", {
                            name:
                              user.name?.split(" ")[0] ||
                              (locale === "en" ? "Pet Lover" : "পোষ্য প্রেমী"),
                          })
                        : t("mobileMenu.welcome")}
                    </p>
                    <p className="font-medium text-white text-lg">
                      {user
                        ? t("mobileMenu.searchForPet")
                        : t("mobileMenu.bestProducts")}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <PawPrint className="h-4 w-4 text-white/80" />
                      <PawPrint className="h-4 w-4 text-white/90" />
                      <PawPrint className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Quick Links with Solid Backgrounds */}
                  <div className="grid grid-cols-3 gap-2 p-4 bg-white">
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
                                ? "bg-orange-500 text-white shadow-md"
                                : "bg-orange-50 text-orange-700 hover:bg-orange-100 hover:scale-105 active:scale-95 border border-orange-200"
                            }
                          `}
                          >
                            <Icon
                              className={`h-5 w-5 ${isActive ? "text-white" : "text-orange-500"}`}
                            />
                            <span className="text-xs font-medium">
                              {getQuickLinkLabel(link)}
                            </span>
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>

                  {/* Pet Categories Pills */}
                  <div className="px-4 py-2 bg-white">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                      <span className="w-1 h-4 bg-orange-500 rounded-full" />
                      {t("mobileMenu.popularCategories")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {petCategories.map((cat, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${cat.color} border border-orange-200`}
                        >
                          <span>{cat.icon}</span>
                          <span>{getPetCategoryLabel(cat)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Main Navigation with Solid Backgrounds */}
                  <div className="flex-1 px-4 py-2 bg-white">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                      <span className="w-1 h-4 bg-orange-500 rounded-full" />
                      {t("mobileMenu.productList")}
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
                                  ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
                                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
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

                              {/* Icon */}
                              {typeof link.icon === "string" ? (
                                <span className="text-xl">{link.icon}</span>
                              ) : (
                                <link.icon
                                  className={`
                                  h-5 w-5 transition-all duration-200
                                  ${isActive ? "text-orange-500" : "text-gray-500 group-hover:text-orange-500"}
                                `}
                                  aria-hidden="true"
                                />
                              )}

                              <div className="flex flex-col flex-1">
                                <span>{getNavLabel(link)}</span>
                                <span className="text-xs text-gray-500 group-hover:text-orange-500/70">
                                  {locale === "en" ? link.label : link.labelEn}
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

                  {/* User Section with Solid Background */}
                  <div className="border-t border-orange-200 bg-orange-50 px-4 py-4">
                    {user ? (
                      <>
                        <div className="mb-3 px-4 py-3 bg-white rounded-xl border border-orange-200">
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                              {t("nav.admin")}
                            </span>
                          )}
                        </div>

                        <SheetClose asChild>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-[0.98] group mb-2 border border-orange-200"
                          >
                            <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                              <User className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">
                                {t("nav.account")}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t("nav.profileView")}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/account/orders"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-[0.98] group mb-2 border border-orange-200"
                          >
                            <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                              <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">
                                {t("nav.orders")}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t("nav.trackOrders")}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                          </Link>
                        </SheetClose>

                        {isAdmin && (
                          <SheetClose asChild>
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-[0.98] group mb-2 border border-orange-200"
                            >
                              <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                                <Settings className="h-5 w-5 text-orange-500" />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">
                                  {t("nav.adminPanel")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t("nav.manage")}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                          </SheetClose>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 bg-white text-red-600 hover:bg-red-50 transition-all active:scale-[0.98] group border border-red-200"
                        >
                          <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                            <LogOut className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="font-medium flex-1 text-left">
                            {t("nav.logout")}
                          </span>
                          <ChevronRight className="h-4 w-4 text-red-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 text-center bg-white p-4 rounded-xl border border-orange-200">
                          <p className="text-gray-700 mb-3">
                            {t("mobileMenu.noAccount")}
                          </p>
                          <div className="flex gap-2">
                            <SheetClose asChild className="flex-1">
                              <Link href="/auth/login">
                                <Button
                                  variant="outline"
                                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-100 bg-white"
                                >
                                  {t("nav.login")}
                                </Button>
                              </Link>
                            </SheetClose>
                            <SheetClose asChild className="flex-1">
                              <Link href="/auth/register">
                                <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                                  {t("nav.register")}
                                </Button>
                              </Link>
                            </SheetClose>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Promo Banner */}
                  <div className="mx-4 my-3 rounded-xl bg-orange-500 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 fill-white" />
                      <p className="text-sm font-medium">
                        {t("mobileMenu.specialOffer")}
                      </p>
                    </div>
                    <p className="text-xs opacity-90">
                      {t("mobileMenu.firstOrderDiscount")}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 bg-white text-orange-600 hover:bg-orange-50 h-8 text-xs"
                    >
                      {t("mobileMenu.buyNow")}
                    </Button>
                  </div>

                  {/* Language Toggle */}
                  <LanguageToggleMobile />

                  {/* Footer */}
                  <div className="border-t border-orange-200 bg-white p-4 text-center text-xs text-gray-600">
                    <p>
                      &copy; 2024 PetBazaar. {t("mobileMenu.allRightsReserved")}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="transition-transform group-hover:scale-105 group-active:scale-95">
                <PetLogo />
              </div>
              <span className="text-xl font-bold text-orange-600 hidden sm:inline">
                PetBazaar
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative text-sm font-medium transition-colors py-2 flex items-center gap-1
                    ${
                      isActive
                        ? "text-orange-600"
                        : "text-gray-700 hover:text-orange-500"
                    }
                  `}
                >
                  {typeof link.icon === "string" && <span>{link.icon}</span>}
                  {getNavLabel(link)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4"
          >
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-orange-500" />
              <Input
                type="search"
                placeholder={t("nav.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 bg-orange-50 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-500"
              />
            </div>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-600 hover:bg-orange-100 hover:text-orange-700 active:scale-95 transition-all min-w-[44px] min-h-[44px]"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="h-auto bg-white border-b border-orange-200"
              >
                <form onSubmit={handleSearch} className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                    <Input
                      type="search"
                      placeholder={t("nav.search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 bg-orange-50 border-orange-200 focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <WishlistButton serverWishlistCount={wishlistCount} />
            <CartButton serverCartCount={cartCount} />

            {/* Language Toggle - Desktop */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-orange-600 hover:bg-orange-100 hover:text-orange-700 active:scale-95 transition-all min-w-[44px] min-h-[44px]"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border-orange-200 bg-white"
                  >
                    <div className="px-2 py-3 bg-orange-50">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          {t("nav.admin")}
                        </span>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-orange-200" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="cursor-pointer hover:text-orange-600 hover:bg-orange-50"
                      >
                        <User className="mr-2 h-4 w-4 text-orange-500" />
                        {t("nav.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/orders"
                        className="cursor-pointer hover:text-orange-600 hover:bg-orange-50"
                      >
                        <Package className="mr-2 h-4 w-4 text-orange-500" />
                        {t("nav.orders")}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-orange-200" />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="cursor-pointer hover:text-orange-600 hover:bg-orange-50"
                          >
                            <Settings className="mr-2 h-4 w-4 text-orange-500" />
                            {t("nav.adminPanel")}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-orange-200" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:bg-orange-100"
                    >
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className="bg-orange-500 text-white hover:bg-orange-600"
                    >
                      {t("nav.register")}
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
      className="text-orange-500 transition-all duration-300 hover:rotate-3 hover:scale-110"
    >
      {/* Paw print logo with orange theme */}
      <circle cx="16" cy="20" r="8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="10" cy="12" r="3" fill="currentColor" />
      <circle cx="22" cy="12" r="3" fill="currentColor" />
      <circle cx="7" cy="18" r="2.5" fill="currentColor" />
      <circle cx="25" cy="18" r="2.5" fill="currentColor" />
      <ellipse cx="16" cy="22" rx="5" ry="4" fill="currentColor" />
    </svg>
  );
}
