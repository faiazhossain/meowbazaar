"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";

interface FosterFiltersProps {
  divisions: string[];
}

export function FosterFilters({ divisions }: FosterFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/foster?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/foster");
  };

  const activeFilterCount = [
    searchParams.get("division"),
    searchParams.get("area"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("acceptsKittens"),
    searchParams.get("minRating"),
    searchParams.get("verified"),
  ].filter(Boolean).length;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ফিল্টার / Filters
            {activeFilterCount > 0 && (
              <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              সাফ করুন / Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Division Filter */}
        <div>
          <Label htmlFor="division">বিভাগ / Division</Label>
          <Select
            value={searchParams.get("division") || ""}
            onValueChange={(value) => updateFilters("division", value || undefined)}
          >
            <SelectTrigger id="division">
              <SelectValue placeholder="সব বিভাগ / All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব বিভাগ / All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Filter */}
        <div>
          <Label htmlFor="area">এলাকা / Area</Label>
          <Input
            id="area"
            placeholder="এলাকা লিখুন / Enter area"
            value={searchParams.get("area") || ""}
            onChange={(e) => updateFilters("area", e.target.value || undefined)}
          />
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label>মূল্য সীমা (প্রতি দিন) / Price Range (per day)</Label>
          <div className="mt-2 space-y-3">
            <div>
              <Label htmlFor="minPrice" className="text-xs">সর্বনিম্ন / Minimum</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={searchParams.get("minPrice") || ""}
                onChange={(e) => updateFilters("minPrice", e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs">সর্বোচ্চ / Maximum</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="5000"
                value={searchParams.get("maxPrice") || ""}
                onChange={(e) => updateFilters("maxPrice", e.target.value || undefined)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div>
          <Label>ন্যূনতম রেটিং / Minimum Rating</Label>
          <div className="mt-2 flex gap-2">
            {[4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={searchParams.get("minRating") === rating.toString() ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateFilters(
                    "minRating",
                    searchParams.get("minRating") === rating.toString() ? undefined : rating.toString()
                  )
                }
              >
                {rating}+ ⭐
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Additional Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={searchParams.get("verified") === "true"}
              onCheckedChange={(checked) =>
                updateFilters("verified", checked ? "true" : undefined)
              }
            />
            <Label htmlFor="verified" className="cursor-pointer">
              যাচাইকৃত ফস্টার হোম / Verified Foster Homes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptsKittens"
              checked={searchParams.get("acceptsKittens") === "true"}
              onCheckedChange={(checked) =>
                updateFilters("acceptsKittens", checked ? "true" : undefined)
              }
            />
            <Label htmlFor="acceptsKittens" className="cursor-pointer">
              বিড়ালছানা গ্রহণ করে / Accepts Kittens
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
