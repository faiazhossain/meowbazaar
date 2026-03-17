"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Save, Globe, Eye } from "lucide-react";
import Link from "next/link";
import {
  createBlogPost,
} from "@/lib/actions/blog";
import { BlogPreview } from "@/components/admin/blog-preview";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { generateSlug } from "@/lib/utils";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    titleEn: "",
    slug: "",
    slugEn: "",
    excerpt: "",
    excerptEn: "",
    content: "",
    contentEn: "",
    image: "",
    category: "",
    petType: "",
    published: false,
    featured: false,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Handle image upload (client-side, you'll need to implement actual upload)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just use a placeholder URL
      // In production, you'd upload to a CDN/storage service
      setFormData({ ...formData, image: "/placeholder.jpg" });
      setImagePreview("/placeholder.jpg");
    }
  };

  useEffect(() => {
    // Auto-generate slug from Bengali title
    if (formData.title) {
      const banglaSlug = formData.title
        .toLowerCase()
        .replace(/[^ঁ-৯a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData({ ...formData, slug: banglaSlug });
    }
  }, [formData.title]);

  useEffect(() => {
    // Auto-generate English slug from English title
    if (formData.titleEn) {
      setFormData({ ...formData, slugEn: generateSlug(formData.titleEn) });
    }
  }, [formData.titleEn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await createBlogPost(formData);

      if (result.success) {
        toast.success("ব্লগ পোস্ট তৈরি হয়েছে");
        router.push("/admin/blog");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              নতুন ব্লগ পোস্ট
            </h1>
            <p className="text-muted-foreground">
              ব্লগ পোস্টের তথ্য পূরণ করুন
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!formData.title && !formData.titleEn && !formData.excerpt && !formData.excerptEn && !formData.content && !formData.contentEn}
          >
            <Eye className="mr-2 h-4 w-4" />
            প্রিভিউ দেখুন
          </Button>
          {formData.published && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${formData.slugEn || formData.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                সাইটে দেখুন
              </Link>
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            <Save className="mr-2 h-4 w-4" />
            সংরক্ষণ করুন
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bengali Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              বাংলা কন্টেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                শিরোনাম <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="ব্লগ পোস্টের শিরোনাম লিখুন..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">
                সংক্ষিপ্ত বিবরণ <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="ব্লগ পোস্টের সংক্ষিপ্ত বিবরণ লিখুন..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                কন্টেন্ট (Markdown) <span className="text-destructive">*</span>
              </Label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                placeholder="ব্লগ পোস্টের কন্টেন্ট লিখুন (Markdown ফরম্যাটে)..."
                rows={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* English Content */}
        <Card>
          <CardHeader>
            <CardTitle>English Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleEn">Title</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) =>
                  setFormData({ ...formData, titleEn: e.target.value })
                }
                placeholder="Blog post title in English..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerptEn">Excerpt</Label>
              <Textarea
                id="excerptEn"
                value={formData.excerptEn}
                onChange={(e) =>
                  setFormData({ ...formData, excerptEn: e.target.value })
                }
                placeholder="Short description in English..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentEn">Content (Markdown)</Label>
              <MarkdownEditor
                value={formData.contentEn}
                onChange={(value) =>
                  setFormData({ ...formData, contentEn: value })
                }
                placeholder="Blog post content in English (Markdown format)..."
                rows={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>মেটাডেটা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">
                  স্লাগ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="blog-post-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  ইউনিক URL স্লাগ (অটো-জেনারেট হয়)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slugEn">
                  English Slug <span className="text-muted-foreground">(recommended)</span>
                </Label>
                <Input
                  id="slugEn"
                  value={formData.slugEn}
                  onChange={(e) =>
                    setFormData({ ...formData, slugEn: e.target.value })
                  }
                  placeholder="blog-post-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL slug for English (auto-generated from English title)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  ক্যাটাগরি <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="পোষা প্রাণীর যত্ন">
                      পোষা প্রাণীর যত্ন
                    </SelectItem>
                    <SelectItem value="খাদ্য ও পুষ্টি">খাদ্য ও পুষ্টি</SelectItem>
                    <SelectItem value="স্বাস্থ্য ও রোগ">
                      স্বাস্থ্য ও রোগ
                    </SelectItem>
                    <SelectItem value="প্রশিক্ষণ">প্রশিক্ষণ</SelectItem>
                    <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="petType">
                  পেট টাইপ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.petType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, petType: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="পেট টাইপ সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat">বিড়াল</SelectItem>
                    <SelectItem value="dog">কুকুর</SelectItem>
                    <SelectItem value="bird">পাখি</SelectItem>
                    <SelectItem value="fish">মাছ</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ইমেজ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">
                  কভার ইমেজ <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFormData({ ...formData, image: "" });
                      setImagePreview("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>সেটিংস</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">পাবলিশ করুন</Label>
                <p className="text-sm text-muted-foreground">
                  পোস্টটি সর্বজনীনভাবে দৃশ্যমান হবে
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured">ফিচার্ড পোস্ট</Label>
                <p className="text-sm text-muted-foreground">
                  পোস্টটি হোমপেজে ফিচার্ড হবে
                </p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </form>

      <BlogPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={formData}
      />
    </div>
  );
}
