"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImageIcon,
  X,
  Plus,
  Save,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/actions/admin";

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  image: string;
  images: string | null;
  categoryId: string;
  stock: number;
  inStock: boolean;
  isNew: boolean;
  hasCOD: boolean;
  rating: number;
  reviewCount: number;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
  mode: "create" | "edit";
}

export function ProductForm({ categories, product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    nameEn: string;
    description: string;
    price: string;
    mrp: string;
    categoryId: string;
    stock: string;
    isNew: boolean;
    hasCOD: boolean;
    image: string;
    images: string[];
  }>({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    mrp: product?.mrp?.toString() || "",
    categoryId: product?.categoryId || "",
    stock: product?.stock?.toString() || "0",
    isNew: product?.isNew ?? true,
    hasCOD: product?.hasCOD ?? true,
    image: product?.image || "",
    images: product?.images ? JSON.parse(product.images) : [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImageUrl, setNewImageUrl] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "বাংলা নাম আবশ্যক";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "সঠিক মূল্য দিন";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "ক্যাটাগরি নির্বাচন করুন";
    }
    if (!formData.image.trim()) {
      newErrors.image = "প্রধান ছবি আবশ্যক";
    }
    if (formData.mrp && parseFloat(formData.mrp) < parseFloat(formData.price)) {
      newErrors.mrp = "MRP মূল্যের চেয়ে কম হতে পারবে না";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("ফর্ম সঠিকভাবে পূরণ করুন");
      return;
    }

    startTransition(async () => {
      const data = {
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock, 10) || 0,
        isNew: formData.isNew,
        hasCOD: formData.hasCOD,
        image: formData.image,
        images: formData.images.length > 0 ? formData.images : undefined,
      };

      const result =
        mode === "create"
          ? await createProduct(data)
          : await updateProduct({ id: product!.id, ...data });

      if (result.success) {
        toast.success(
          mode === "create" ? "পণ্য তৈরি হয়েছে" : "পণ্য আপডেট হয়েছে"
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "কিছু ভুল হয়েছে");
      }
    });
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "create" ? "নতুন পণ্য যোগ করুন" : "পণ্য এডিট করুন"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "নতুন পণ্যের তথ্য পূরণ করুন"
              : `"${product?.name}" এডিট করুন`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div
              className="bg-card rounded-lg p-6 border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                মৌলিক তথ্য
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">বাংলা নাম *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="যেমন: রয়্যাল ক্যানিন ক্যাট ফুড ২কেজি"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameEn">ইংরেজি নাম</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="e.g., Royal Canin Cat Food 2kg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">বিবরণ</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">ক্যাটাগরি *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.categoryId ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.nameEn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div
              className="bg-card rounded-lg p-6 border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                মূল্য ও স্টক
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">বিক্রয় মূল্য (৳) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={errors.price ? "border-destructive" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (৳)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      value={formData.mrp}
                      onChange={(e) =>
                        setFormData({ ...formData, mrp: e.target.value })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={errors.mrp ? "border-destructive" : ""}
                    />
                    {errors.mrp && (
                      <p className="text-sm text-destructive">{errors.mrp}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">স্টক পরিমাণ</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="isNew">নতুন পণ্য হিসেবে দেখান</Label>
                    <p className="text-sm text-muted-foreground">
                      &quot;New&quot; ব্যাজ দেখাবে
                    </p>
                  </div>
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isNew: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="hasCOD">ক্যাশ অন ডেলিভারি</Label>
                    <p className="text-sm text-muted-foreground">
                      COD অপশন দেখাবে
                    </p>
                  </div>
                  <Switch
                    id="hasCOD"
                    checked={formData.hasCOD}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hasCOD: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <div
              className="bg-card rounded-lg p-6 border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                ছবি ম্যানেজমেন্ট
              </h2>

              <div className="space-y-4">
                {/* Main Image */}
                <div className="space-y-2">
                  <Label htmlFor="image">প্রধান ছবির URL *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className={errors.image ? "border-destructive" : ""}
                  />
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image}</p>
                  )}

                  {formData.image && (
                    <div className="relative w-full aspect-square max-w-50 rounded-lg overflow-hidden bg-muted mt-2">
                      <Image
                        src={formData.image}
                        alt="Main preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/200";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Images */}
                <div className="space-y-2">
                  <Label>অতিরিক্ত ছবি</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image2.jpg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addImage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {formData.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                        >
                          <Image
                            src={img}
                            alt={`Additional ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/100";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full hover:bg-black/70"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload Tips */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        ছবি আপলোড করতে:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <a
                            href="https://imgbb.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            imgbb.com
                          </a>{" "}
                          এ ছবি আপলোড করুন
                        </li>
                        <li>Direct link কপি করুন</li>
                        <li>এখানে পেস্ট করুন</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {formData.name && formData.image && (
              <div
                className="bg-card rounded-lg p-6 border border-border"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  প্রিভিউ
                </h2>
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-2">
                      {formData.name}
                    </h3>
                    {formData.nameEn && (
                      <p className="text-sm text-muted-foreground">
                        {formData.nameEn}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-primary">
                        ৳
                        {parseFloat(formData.price || "0").toLocaleString(
                          "bn-BD"
                        )}
                      </span>
                      {formData.mrp &&
                        parseFloat(formData.mrp) >
                          parseFloat(formData.price) && (
                          <span className="text-sm text-muted-foreground line-through">
                            ৳{parseFloat(formData.mrp).toLocaleString("bn-BD")}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              বাতিল
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === "create" ? "পণ্য তৈরি করুন" : "পণ্য আপডেট করুন"}
          </Button>
        </div>
      </form>
    </div>
  );
}
