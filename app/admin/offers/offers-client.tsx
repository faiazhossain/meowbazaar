"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight, Calendar, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
} from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  variant: string;
  isActive: boolean;
  priority: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OffersClientProps {
  initialOffers: Offer[];
}

export function OffersClient({ initialOffers }: OffersClientProps) {
  const [offers, setOffers] = useState(initialOffers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    ctaText: "এখনই অর্ডার করুন",
    ctaTextEn: "Order Now",
    ctaLink: "/products",
    variant: "primary",
    isActive: true,
    priority: 0,
    startDate: "",
    endDate: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      ctaText: "এখনই অর্ডার করুন",
      ctaTextEn: "Order Now",
      ctaLink: "/products",
      variant: "primary",
      isActive: true,
      priority: 0,
      startDate: "",
      endDate: "",
    });
    setEditingOffer(null);
  };

  const handleCreate = () => {
    if (!formData.title || !formData.titleEn || !formData.description || !formData.descriptionEn) {
      toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    startTransition(async () => {
      const result = await createOffer({
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        ctaText: formData.ctaText,
        ctaTextEn: formData.ctaTextEn,
        ctaLink: formData.ctaLink,
        variant: formData.variant,
        isActive: formData.isActive,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      });

      if (result.success && result.offer) {
        setOffers([result.offer, ...offers]);
        toast.success("অফার তৈরি হয়েছে");
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "অফার তৈরি করা যায়নি");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingOffer || !formData.title || !formData.titleEn || !formData.description || !formData.descriptionEn) {
      toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    startTransition(async () => {
      const result = await updateOffer({
        id: editingOffer.id,
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        ctaText: formData.ctaText,
        ctaTextEn: formData.ctaTextEn,
        ctaLink: formData.ctaLink,
        variant: formData.variant,
        isActive: formData.isActive,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      });

      if (result.success && result.offer) {
        setOffers(offers.map((o) => (o.id === editingOffer.id ? result.offer! : o)));
        toast.success("অফার আপডেট হয়েছে");
        setEditingOffer(null);
        resetForm();
      } else {
        toast.error(result.error || "অফার আপডেট করা যায়নি");
      }
    });
  };

  const handleDelete = (offerId: string) => {
    startTransition(async () => {
      const result = await deleteOffer(offerId);

      if (result.success) {
        setOffers(offers.filter((o) => o.id !== offerId));
        toast.success("অফার মুছে ফেলা হয়েছে");
      } else {
        toast.error(result.error || "অফার মুছে ফেলা যায়নি");
      }
    });
  };

  const handleToggle = (offerId: string) => {
    startTransition(async () => {
      const result = await toggleOffer(offerId);

      if (result.success && result.isActive !== undefined) {
        setOffers(
          offers.map((o) => (o.id === offerId ? { ...o, isActive: result.isActive! } : o))
        );
        toast.success(result.isActive ? "অফার সক্রিয় করা হয়েছে" : "অফার নিষ্ক্রিয় করা হয়েছে");
      } else {
        toast.error(result.error || "অফার স্ট্যাটাস পরিবর্তন করা যায়নি");
      }
    });
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      titleEn: offer.titleEn,
      description: offer.description,
      descriptionEn: offer.descriptionEn,
      ctaText: offer.ctaText,
      ctaTextEn: offer.ctaTextEn,
      ctaLink: offer.ctaLink,
      variant: offer.variant,
      isActive: offer.isActive,
      priority: offer.priority,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 10) : "",
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 10) : "",
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    if (!offer.isActive) return false;
    if (offer.startDate && new Date(offer.startDate) > now) return false;
    if (offer.endDate && new Date(offer.endDate) < now) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">অফার ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">মোট {offers.length} টি অফার</p>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4" />
              নতুন অফার
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন অফার তৈরি করুন</DialogTitle>
            </DialogHeader>
            <OfferForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              isPending={isPending}
              submitLabel="তৈরি করুন"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Offers List */}
      <div className="grid gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={cn(
              "bg-card rounded-lg border border-border p-4 transition-all",
              !isOfferActive(offer) && "opacity-60"
            )}
          >
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{offer.title}</h3>
                    <span className="text-sm text-muted-foreground">|</span>
                    <span className="text-sm text-muted-foreground">{offer.titleEn}</span>
                    {!isOfferActive(offer) && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                </div>

                {/* Status Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(offer.id)}
                  disabled={isPending}
                  className={cn(offer.isActive ? "text-green-600" : "text-muted-foreground")}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : offer.isActive ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" />
                  <span>অগ্রাধিকার: {offer.priority}</span>
                </div>
                {offer.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>শুরু: {formatDate(offer.startDate)}</span>
                  </div>
                )}
                {offer.endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>শেষ: {formatDate(offer.endDate)}</span>
                  </div>
                )}
                <span className="px-2 py-0.5 rounded-full bg-muted">
                  CTA: {offer.ctaLink}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full",
                    offer.variant === "primary"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/10 text-accent"
                  )}
                >
                  {offer.variant}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(offer)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      এডিট
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>অফার এডিট করুন</DialogTitle>
                    </DialogHeader>
                    <OfferForm
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
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      মুছে ফেলুন
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>অফার মুছে ফেলতে চান?</AlertDialogTitle>
                      <AlertDialogDescription>
                        এই ক্রিয়া পূর্বাবস্থায় ফেরানো যাবে না।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(offer.id)}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        মুছে ফেলুন
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
      {offers.length === 0 && (
        <div className="text-center py-12">
          <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">কোন অফার নেই</h3>
          <p className="text-muted-foreground mt-1">প্রথম অফার তৈরি করুন</p>
        </div>
      )}
    </div>
  );
}

interface OfferFormProps {
  formData: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    ctaText: string;
    ctaTextEn: string;
    ctaLink: string;
    variant: string;
    isActive: boolean;
    priority: number;
    startDate: string;
    endDate: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}

function OfferForm({ formData, setFormData, onSubmit, isPending, submitLabel }: OfferFormProps) {
  return (
    <div className="space-y-4">
      {/* Bengali Title */}
      <div className="space-y-2">
        <Label htmlFor="title">বাংলা শিরোনাম *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="যেমন: ৫% ক্যাশব্যাক"
        />
      </div>

      {/* English Title */}
      <div className="space-y-2">
        <Label htmlFor="titleEn">ইংরেজি শিরোনাম *</Label>
        <Input
          id="titleEn"
          value={formData.titleEn}
          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
          placeholder="e.g., 5% Cashback"
        />
      </div>

      {/* Bengali Description */}
      <div className="space-y-2">
        <Label htmlFor="description">বাংলা বিবরণ *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="অফার সম্পর্কে বিস্তারিত লিখুন"
          rows={3}
        />
      </div>

      {/* English Description */}
      <div className="space-y-2">
        <Label htmlFor="descriptionEn">ইংরেজি বিবরণ *</Label>
        <Textarea
          id="descriptionEn"
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          placeholder="Write offer details in English"
          rows={3}
        />
      </div>

      {/* CTA Text */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ctaText">বাংলা বাটন টেক্সট</Label>
          <Input
            id="ctaText"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            placeholder="এখনই অর্ডার করুন"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaTextEn">ইংরেজি বাটন টেক্সট</Label>
          <Input
            id="ctaTextEn"
            value={formData.ctaTextEn}
            onChange={(e) => setFormData({ ...formData, ctaTextEn: e.target.value })}
            placeholder="Order Now"
          />
        </div>
      </div>

      {/* CTA Link */}
      <div className="space-y-2">
        <Label htmlFor="ctaLink">বাটন লিংক</Label>
        <Input
          id="ctaLink"
          value={formData.ctaLink}
          onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
          placeholder="/products"
        />
      </div>

      {/* Variant */}
      <div className="space-y-2">
        <Label htmlFor="variant">ভ্যারিয়েন্ট</Label>
        <Select
          value={formData.variant}
          onValueChange={(value) => setFormData({ ...formData, variant: value })}
        >
          <SelectTrigger id="variant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary (প্রাথমিক)</SelectItem>
            <SelectItem value="accent">Accent (বিকল্প)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="isActive">সক্রিয়</Label>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">অগ্রাধিকার (বেশি হলে উপরে দেখাবে)</Label>
        <Input
          id="priority"
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">শুরুর তারিখ (ঐচ্ছিক)</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">শেষ তারিখ (ঐচ্ছিক)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
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
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
