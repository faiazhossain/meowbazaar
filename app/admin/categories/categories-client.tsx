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
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/admin";

interface Category {
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

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    image: "",
  });

  const resetForm = () => {
    setFormData({ name: "", nameEn: "", image: "" });
    setEditingCategory(null);
  };

  const handleCreate = () => {
    if (!formData.name || !formData.nameEn) {
      toast.error("নাম এবং ইংরেজি নাম আবশ্যক");
      return;
    }

    startTransition(async () => {
      const result = await createCategory({
        name: formData.name,
        nameEn: formData.nameEn,
        image: formData.image || undefined,
      });

      if (result.success && result.category) {
        setCategories([
          { ...result.category, _count: { products: 0 } },
          ...categories,
        ]);
        toast.success("ক্যাটাগরি তৈরি হয়েছে");
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "ক্যাটাগরি তৈরি করা যায়নি");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name || !formData.nameEn) {
      toast.error("নাম এবং ইংরেজি নাম আবশ্যক");
      return;
    }

    startTransition(async () => {
      const result = await updateCategory({
        id: editingCategory.id,
        name: formData.name,
        nameEn: formData.nameEn,
        image: formData.image || undefined,
      });

      if (result.success && result.category) {
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id
              ? { ...result.category!, _count: c._count }
              : c
          )
        );
        toast.success("ক্যাটাগরি আপডেট হয়েছে");
        setEditingCategory(null);
        resetForm();
      } else {
        toast.error(result.error || "ক্যাটাগরি আপডেট করা যায়নি");
      }
    });
  };

  const handleDelete = (categoryId: string) => {
    startTransition(async () => {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        setCategories(categories.filter((c) => c.id !== categoryId));
        toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
      } else {
        toast.error(result.error || "ক্যাটাগরি মুছে ফেলা যায়নি");
      }
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      image: category.image || "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ক্যাটাগরি ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground">
            মোট {categories.length} টি ক্যাটাগরি
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
              নতুন ক্যাটাগরি
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>নতুন ক্যাটাগরি তৈরি করুন</DialogTitle>
            </DialogHeader>
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              isPending={isPending}
              submitLabel="তৈরি করুন"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
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
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.nameEn}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {category._count.products} টি পণ্য
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>ক্যাটাগরি এডিট করুন</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
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
                        ক্যাটাগরি মুছে ফেলতে চান?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        এই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।{" "}
                        {category._count.products > 0 && (
                          <span className="text-destructive font-medium">
                            এই ক্যাটাগরিতে {category._count.products} টি পণ্য
                            আছে।
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
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
      {categories.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            কোন ক্যাটাগরি নেই
          </h3>
          <p className="text-muted-foreground mt-1">
            প্রথম ক্যাটাগরি তৈরি করুন
          </p>
        </div>
      )}
    </div>
  );
}

interface CategoryFormProps {
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

function CategoryForm({
  formData,
  setFormData,
  onSubmit,
  isPending,
  submitLabel,
}: CategoryFormProps) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">বাংলা নাম *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="যেমন: কুকুরের খাবার"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameEn">ইংরেজি নাম *</Label>
        <Input
          id="nameEn"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          placeholder="e.g., Dog Food"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">ছবির URL (ঐচ্ছিক)</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => {
            setFormData({ ...formData, image: e.target.value });
            setPreviewError(false);
          }}
          placeholder="https://example.com/image.jpg"
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
