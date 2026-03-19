"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Loader2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/actions/admin";

interface Brand {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

interface BrandsClientProps {
  initialBrands: Brand[];
}

export function BrandsClient({ initialBrands }: BrandsClientProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    image: "",
  });

  const resetForm = () => {
    setFormData({ name: "", nameEn: "", image: "" });
    setEditingBrand(null);
  };

  const handleCreate = () => {
    if (!formData.name || !formData.nameEn) {
      toast.error("নাম এবং ইংরেজি নাম আবশ্যক");
      return;
    }

    startTransition(async () => {
      const result = await createBrand({
        name: formData.name,
        nameEn: formData.nameEn,
        image: formData.image || undefined,
      });

      if (result.success && result.brand) {
        setBrands([
          { ...result.brand, _count: { products: 0 } },
          ...brands,
        ]);
        toast.success("ব্র্যান্ড তৈরি হয়েছে");
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "ব্র্যান্ড তৈরি করা যায়নি");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingBrand || !formData.name || !formData.nameEn) {
      toast.error("নাম এবং ইংরেজি নাম আবশ্যক");
      return;
    }

    startTransition(async () => {
      const result = await updateBrand({
        id: editingBrand.id,
        name: formData.name,
        nameEn: formData.nameEn,
        image: formData.image || undefined,
      });

      if (result.success && result.brand) {
        setBrands(
          brands.map((b) =>
            b.id === editingBrand.id
              ? { ...result.brand!, _count: b._count }
              : b
          )
        );
        toast.success("ব্র্যান্ড আপডেট হয়েছে");
        setEditingBrand(null);
        resetForm();
      } else {
        toast.error(result.error || "ব্র্যান্ড আপডেট করা যায়নি");
      }
    });
  };

  const handleDelete = (brandId: string) => {
    startTransition(async () => {
      const result = await deleteBrand(brandId);

      if (result.success) {
        setBrands(brands.filter((b) => b.id !== brandId));
        toast.success("ব্র্যান্ড মুছে ফেলা হয়েছে");
      } else {
        toast.error(result.error || "ব্র্যান্ড মুছে ফেলা যায়নি");
      }
    });
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      nameEn: brand.nameEn,
      image: brand.image || "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ব্র্যান্ড ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">
            মোট {brands.length} টি ব্র্যান্ড
          </p>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4" />
              নতুন ব্র্যান্ড
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>নতুন ব্র্যান্ড তৈরি করুন</DialogTitle>
            </DialogHeader>
            <BrandForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              isPending={isPending}
              submitLabel="তৈরি করুন"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {brand.image ? (
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {brand.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {brand.nameEn}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {brand._count.products} টি পণ্য
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>ব্র্যান্ড এডিট করুন</DialogTitle>
                    </DialogHeader>
                    <BrandForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleUpdate}
                      isPending={isPending}
                      submitLabel="আপডেট করুন"
                    />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ব্র্যান্ড মুছে ফেলতে চান?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        এই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।{" "}
                        {brand._count.products > 0 && (
                          <span className="text-destructive font-medium">
                            এই ব্র্যান্ডে {brand._count.products} টি পণ্য
                            আছে।
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(brand.id)}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "মুছে ফেলুন"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {brands.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            কোন ব্র্যান্ড নেই
          </h3>
          <p className="text-muted-foreground mt-1">
            প্রথম ব্র্যান্ড তৈরি করুন
          </p>
        </div>
      )}
    </div>
  );
}

interface BrandFormProps {
  formData: {
    name: string;
    nameEn: string;
    image: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      nameEn: string;
      image: string;
    }>
  >;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}

function BrandForm({
  formData,
  setFormData,
  onSubmit,
  isPending,
  submitLabel,
}: BrandFormProps) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">বাংলা নাম *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="যেমন: রয়্যাল ক্যানিন"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameEn">ইংরেজি নাম *</Label>
        <Input
          id="nameEn"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          placeholder="e.g., Royal Canin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">ব্র্যান্ড লোগোর URL (ঐচ্ছিক)</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => {
            setFormData({ ...formData, image: e.target.value });
            setPreviewError(false);
          }}
          placeholder="https://example.com/logo.jpg"
        />
        {formData.image && !previewError && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted mt-2">
            <Image
              src={formData.image}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, image: "" })}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
      </div>

      <DialogFooter className="pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            বাতিল
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="bg-primary hover:bg-brand-orange-dark text-primary-foreground"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
