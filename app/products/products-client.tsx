"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Footer } from "@/components/layout/footer";
import { ProductCard, Product } from "@/components/product/product-card";
import { Section, ProductGrid } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
}

const brands = ["Royal Canin", "Whiskas", "Me-O", "Kit Cat", "Fancy Feast"];

const sortOptions = [
  { value: "newest", label: "products.sort.newest" },
  { value: "price-low", label: "products.sort.priceLow" },
  { value: "price-high", label: "products.sort.priceHigh" },
  { value: "bestseller", label: "products.sort.bestseller" },
  { value: "rating", label: "products.sort.rating" },
];

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  cartCount: number;
  wishlistCount: number;
}

export function ProductsClient({
  initialProducts,
  categories,
  user,
  cartCount,
  wishlistCount,
}: ProductsClientProps) {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("pet") || searchParams.get("category");
  const searchParam = searchParams.get("search");

  // Helper function to get localized category name
  const getLocalizedName = (name: string, nameEn?: string) => {
    return locale === "en" && nameEn ? nameEn : name;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Filter by search
    if (searchParam) {
      const search = searchParam.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.nameEn?.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by price
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by stock
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "bestseller":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [
    initialProducts,
    selectedCategory,
    priceRange,
    sortBy,
    inStockOnly,
    searchParam,
  ]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setPriceRange([0, 5000]);
    setInStockOnly(false);
  };

  const categoryTitle = searchParam
    ? t("products.searchResults", { search: searchParam })
    : selectedCategory === "all"
      ? t("products.title")
      : getLocalizedName(
          categories.find((c) => c.slug === selectedCategory)?.name || "",
          categories.find((c) => c.slug === selectedCategory)?.nameEn
        );

  return (
    <div className="min-h-screen bg-background">
      <NavbarClient
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        user={user}
      />

      <main>
        {/* Page Header */}
        <div className="bg-muted py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {categoryTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} {t("products.resultsFound")}
            </p>
          </div>
        </div>

        <Section>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                <FilterSection
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  clearFilters={clearFilters}
                  t={t}
                  locale={locale}
                  getLocalizedName={getLocalizedName}
                />
              </div>
            </aside>

            {/* Products Area */}
            <div className="flex-1">
              {/* Sort and Mobile Filter */}
              <div className="flex items-center justify-between mb-6 gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t("products.filter")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] bg-card">
                    <SheetHeader className="mb-6">
                      <SheetTitle>{t("products.filterTitle")}</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-auto h-full pb-20">
                      <FilterSection
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        inStockOnly={inStockOnly}
                        setInStockOnly={setInStockOnly}
                        clearFilters={clearFilters}
                        t={t}
                        locale={locale}
                        getLocalizedName={getLocalizedName}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <Label
                    htmlFor="sort"
                    className="text-sm text-muted-foreground hidden sm:inline"
                  >
                    {t("products.sortBy")}
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <ProductGrid>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ProductGrid>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {t("products.noProducts")}
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="link"
                    className="text-primary mt-2"
                  >
                    {t("products.clearFilters")}
                  </Button>
                </div>
              )}

              {/* Load More */}
              {filteredProducts.length > 0 && (
                <div className="mt-8 text-center">
                  <Button variant="outline" className="px-8">
                    {t("products.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

interface FilterSectionProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (value: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  clearFilters: () => void;
  t: any;
  locale: string;
  getLocalizedName: (name: string, nameEn?: string) => string;
}

function FilterSection({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  clearFilters,
  t,
  locale,
  getLocalizedName,
}: FilterSectionProps) {
  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {t("products.filter")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs text-primary"
        >
          <X className="h-3 w-3 mr-1" />
          {t("common.reset")}
        </Button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium text-foreground mb-3">
          {t("products.category")}
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedCategory === "all"}
              onCheckedChange={() => setSelectedCategory("all")}
            />
            <span className="text-sm">{t("products.allProducts")}</span>
          </label>
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategory === category.slug}
                onCheckedChange={() => setSelectedCategory(category.slug)}
              />
              <span className="text-sm">
                {getLocalizedName(category.name, category.nameEn)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="font-medium text-foreground mb-3">
          {t("products.brand")}
        </h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand]);
                  } else {
                    setSelectedBrands(
                      selectedBrands.filter((b) => b !== brand)
                    );
                  }
                }}
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium text-foreground mb-3">
          {t("products.price")}
        </h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={5000}
            step={100}
            className="mb-4"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-24 text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-24 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(!!checked)}
          />
          <span className="text-sm">{t("products.inStockOnly")}</span>
        </label>
      </div>
    </div>
  );
}
