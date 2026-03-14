"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  updateDeliverySettings,
  deleteDeliverySettings,
  toggleDeliverySettingsStatus,
  initializeDefaultDeliverySettings,
  type DeliverySettingsData,
} from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

interface DeliverySetting {
  id: string;
  division: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  freeDeliveryType: "FREE" | "PERCENTAGE";
  discountPercentage: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DeliverySettingsClientProps {
  initialSettings: DeliverySetting[];
}

export function DeliverySettingsClient({ initialSettings }: DeliverySettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<DeliverySetting | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewSubtotal, setPreviewSubtotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    division: "",
    freeDeliveryThreshold: 500,
    standardDeliveryFee: 60,
    freeDeliveryType: "FREE" as "FREE" | "PERCENTAGE",
    discountPercentage: 50,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      division: "",
      freeDeliveryThreshold: 500,
      standardDeliveryFee: 60,
      freeDeliveryType: "FREE",
      discountPercentage: 50,
      isActive: true,
    });
    setEditingSetting(null);
  };

  const handleCreate = () => {
    if (!formData.division || formData.freeDeliveryThreshold <= 0 || formData.standardDeliveryFee < 0) {
      toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    if (formData.freeDeliveryType === "PERCENTAGE" && (formData.discountPercentage === undefined || formData.discountPercentage < 0 || formData.discountPercentage > 100)) {
      toast.error("ছাড়ের হার ০-১০০% এর মধ্যে হতে হবে");
      return;
    }

    startTransition(async () => {
      const result = await updateDeliverySettings(formData);

      if (result.success && result.settings) {
        setSettings([...settings, result.settings as DeliverySetting]);
        toast.success("ডেলিভারি সেটিংস তৈরি হয়েছে");
        setIsCreateOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "ডেলিভারি সেটিংস তৈরি করা যায়নি");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingSetting || !formData.division || formData.freeDeliveryThreshold <= 0 || formData.standardDeliveryFee < 0) {
      toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    if (formData.freeDeliveryType === "PERCENTAGE" && (formData.discountPercentage === undefined || formData.discountPercentage < 0 || formData.discountPercentage > 100)) {
      toast.error("ছাড়ের হার ০-১০০% এর মধ্যে হতে হবে");
      return;
    }

    startTransition(async () => {
      const result = await updateDeliverySettings(formData);

      if (result.success && result.settings) {
        setSettings(settings.map((s) => s.id === result.settings?.id ? result.settings as DeliverySetting : s));
        toast.success("ডেলিভারি সেটিংস আপডেট হয়েছে");
        setEditingSetting(null);
        resetForm();
      } else {
        toast.error(result.error || "ডেলিভারি সেটিংস আপডেট করা যায়নি");
      }
    });
  };

  const handleDelete = (division: string) => {
    startTransition(async () => {
      const result = await deleteDeliverySettings(division);

      if (result.success) {
        setSettings(settings.filter((s) => s.division !== division));
        toast.success("ডেলিভারি সেটিংস মুছে ফেলা হয়েছে");
      } else {
        toast.error(result.error || "ডেলিভারি সেটিংস মুছে ফেলা যায়নি");
      }
    });
  };

  const handleToggle = (division: string) => {
    startTransition(async () => {
      const result = await toggleDeliverySettingsStatus(division);

      if (result.success) {
        setSettings(settings.map((s) =>
          s.division === division ? { ...s, isActive: result.isActive! } : s
        ));
      } else {
        toast.error(result.error || "স্ট্যাটাস পরিবর্তন করা যায়নি");
      }
    });
  };

  const handleInitializeDefaults = () => {
    startTransition(async () => {
      const result = await initializeDefaultDeliverySettings();

      if (result.success && result.created) {
        setSettings([...settings, ...result.created as DeliverySetting[]]);
        toast.success(result.message);
      } else {
        toast.error(result.error || "ডিফল্ট সেটিংস তৈরি করা যায়নি");
      }
    });
  };

  // Calculate preview delivery fee
  const calculatePreviewFee = () => {
    if (previewSubtotal >= formData.freeDeliveryThreshold) {
      if (formData.freeDeliveryType === "FREE") {
        return 0;
      } else if (formData.freeDeliveryType === "PERCENTAGE" && formData.discountPercentage) {
        const discount = (formData.standardDeliveryFee * formData.discountPercentage) / 100;
        return formData.standardDeliveryFee - discount;
      }
    }
    return formData.standardDeliveryFee;
  };

  const editSetting = (setting: DeliverySetting) => {
    setEditingSetting(setting);
    setFormData({
      division: setting.division,
      freeDeliveryThreshold: setting.freeDeliveryThreshold,
      standardDeliveryFee: setting.standardDeliveryFee,
      freeDeliveryType: setting.freeDeliveryType,
      discountPercentage: setting.discountPercentage || 50,
      isActive: setting.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Initialize Defaults Button */}
      {settings.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ডিফল্ট সেটিংস শুরু করুন</CardTitle>
            <CardDescription>
              বাংলাদেশের ৮টি বিভাগের জন্য ডিফল্ট ডেলিভারি সেটিংস তৈরি করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInitializeDefaults} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              ডিফল্ট সেটিংস তৈরি করুন
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add New Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen || !!editingSetting} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingSetting(null);
            resetForm();
          } else if (!editingSetting) {
            setIsCreateOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSetting(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন সেটিংস যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? "ডেলিভারি সেটিংস আপডেট করুন" : "নতুন ডেলিভারি সেটিংস"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Division Selection */}
              <div>
                <Label htmlFor="division">বিভাগ *</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) => setFormData({ ...formData, division: value })}
                  disabled={!!editingSetting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.filter((d) => !settings.some((s) => s.division === d && s.id !== editingSetting?.id)).map((division) => (
                      <SelectItem key={division} value={division}>
                        {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Free Delivery Threshold */}
                <div>
                  <Label htmlFor="threshold">ফ্রি ডেলিভারি থ্রেশহোল্ড (টাকা) *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.freeDeliveryThreshold}
                    onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Standard Delivery Fee */}
                <div>
                  <Label htmlFor="fee">স্ট্যান্ডার্ড ডেলিভারি ফি (টাকা) *</Label>
                  <Input
                    id="fee"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.standardDeliveryFee}
                    onChange={(e) => setFormData({ ...formData, standardDeliveryFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Free Delivery Type */}
              <div>
                <Label htmlFor="type">ফ্রি ডেলিভারি টাইপ *</Label>
                <Select
                  value={formData.freeDeliveryType}
                  onValueChange={(value: "FREE" | "PERCENTAGE") => setFormData({ ...formData, freeDeliveryType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">সম্পূর্ণ ফ্রি</SelectItem>
                    <SelectItem value="PERCENTAGE">শতাংশ ছাড়</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Percentage (only for PERCENTAGE type) */}
              {formData.freeDeliveryType === "PERCENTAGE" && (
                <div>
                  <Label htmlFor="discount">ছাড়ের শতাংশ (০-১০০%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">এই সেটিংস সক্রিয় করুন</Label>
              </div>

              {/* Preview Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">প্রিভিউ</h4>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <Label htmlFor="previewSubtotal" className="text-sm">টেস্ট অর্ডার মূল্য:</Label>
                    <Input
                      id="previewSubtotal"
                      type="number"
                      min="0"
                      step="10"
                      value={previewSubtotal}
                      onChange={(e) => setPreviewSubtotal(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল:</span>
                      <span className="font-medium">৳{previewSubtotal.toLocaleString("bn-BD")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ফ্রি ডেলিভারি থ্রেশহোল্ড:</span>
                      <span className="font-medium">৳{formData.freeDeliveryThreshold.toLocaleString("bn-BD")}</span>
                    </div>
                    {previewSubtotal >= formData.freeDeliveryThreshold && formData.freeDeliveryType === "PERCENTAGE" && formData.discountPercentage ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ছাড় ({formData.discountPercentage}%):</span>
                        <span className="font-medium text-success">
                          -৳{((formData.standardDeliveryFee * formData.discountPercentage) / 100).toLocaleString("bn-BD")}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">ডেলিভারি ফি:</span>
                      <span className="font-bold text-primary">
                        ৳{calculatePreviewFee().toLocaleString("bn-BD")}
                      </span>
                    </div>
                    {previewSubtotal >= formData.freeDeliveryThreshold && formData.freeDeliveryType === "FREE" && (
                      <p className="text-xs text-success mt-1">ফ্রি ডেলিভারি প্রযোজ্য!</p>
                    )}
                    {previewSubtotal >= formData.freeDeliveryThreshold && formData.freeDeliveryType === "PERCENTAGE" && formData.discountPercentage && (
                      <p className="text-xs text-success mt-1">
                        {formData.discountPercentage}% ছাড় প্রযোজ্য!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">বাতিল</Button>
              </DialogClose>
              <Button
                onClick={editingSetting ? handleUpdate : handleCreate}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingSetting ? "আপডেট করুন" : "তৈরি করুন"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings List */}
      {settings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>সকল ডেলিভারি সেটিংস</CardTitle>
            <CardDescription>
              বিভাগ অনুযায়ী ডেলিভারি ফি এবং ফ্রি ডেলিভারি সেটিংস
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    !setting.isActive && "opacity-50"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{setting.division}</h3>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        setting.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {setting.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">ফ্রি ডেলিভারি</p>
                        <p className="font-medium">৳{setting.freeDeliveryThreshold.toLocaleString("bn-BD")}+</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">স্ট্যান্ডার্ড ফি</p>
                        <p className="font-medium">৳{setting.standardDeliveryFee.toLocaleString("bn-BD")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">টাইপ</p>
                        <p className="font-medium">
                          {setting.freeDeliveryType === "FREE" ? "সম্পূর্ণ ফ্রি" : `${setting.discountPercentage}% ছাড়`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(setting.division)}
                      disabled={isPending}
                    >
                      {setting.isActive ? (
                        <ToggleRight className="h-5 w-5 text-success" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editSetting(setting)}
                      disabled={isPending}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ডেলিভারি সেটিংস মুছে ফেলতে চান?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {setting.division} এর জন্য ডেলিভারি সেটিংস মুছে ফেলা হবে। এটি আর ফেরত আনা যাবে।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(setting.division)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            মুছে ফেলুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
