"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogFilterProps {
  categories: string[];
  selectedCategory?: string;
  selectedPetType?: string;
}

export function BlogFilter({
  categories,
  selectedCategory,
  selectedPetType,
}: BlogFilterProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  };

  const handlePetTypeChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("petType");
    } else {
      params.set("petType", value);
    }
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  };

  const petTypes = ["cat", "dog", "bird", "fish", "other"];

  return (
    <div className="flex gap-4 flex-wrap">
      <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="বিষয়" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব বিষয়</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPetType || "all"} onValueChange={handlePetTypeChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="পোষা প্রকার" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব পোষা</SelectItem>
          {petTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
