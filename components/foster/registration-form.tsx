"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, ChevronLeft, ChevronRight, Check, Info, Plus, Image as ImageIcon } from "lucide-react";
import { createFosterProfile } from "@/lib/actions/foster-registration";
import { toast } from "sonner";

const BANGLADESH_DIVISIONS = [
  "ঢাকা (Dhaka)",
  "চট্টগ্রাম (Chittagong)",
  "রাজশাহী (Rajshahi)",
  "খুলনা (Khulna)",
  "সিলেট (Sylhet)",
  "বরিশাল (Barisal)",
  "রংপুর (Rangpur)",
  "ময়মনসিংহ (Mymensingh)",
];

const SERVICES = [
  { id: "feeding", label: "ফিডিং (Feeding)", labelEn: "Feeding" },
  { id: "grooming", label: "গ্রুমিং (Grooming)", labelEn: "Grooming" },
  { id: "playtime", label: "খেলাধুলা (Playtime)", labelEn: "Playtime" },
  { id: "medical", label: "চিকিৎসা (Medical)", labelEn: "Medical Care" },
  { id: "daily-updates", label: "দৈনিক আপডেট (Daily Updates)", labelEn: "Daily Updates" },
  { id: "photo-updates", label: "ফটো আপডেট (Photo Updates)", labelEn: "Photo Updates" },
];

const FACILITIES = [
  { id: "ac", label: "এসি (AC)", labelEn: "Air Conditioning" },
  { id: "cage", label: "কেজ (Cage)", labelEn: "Cage" },
  { id: "playarea", label: "খেলার জায়গা (Play Area)", labelEn: "Play Area" },
  { id: "veterinary", label: "ভেটেরিনারি (Veterinary)", labelEn: "Veterinary Access" },
  { id: "outdoor", label: "আউটডোর (Outdoor)", labelEn: "Outdoor Space" },
  { id: "isolation", label: "আইসোলেশন (Isolation)", labelEn: "Isolation Room" },
];

const registrationSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  businessNameEn: z.string().optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  descriptionEn: z.string().optional(),
  address: z.string().min(10, "Address must be at least 10 characters"),
  division: z.string().min(1, "Division is required"),
  area: z.string().min(2, "Area is required"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Valid phone number required"),
  altPhone: z.string().regex(/^01[3-9]\d{8}$/, "Valid phone number required").optional().or(z.literal("")),
  email: z.string().email("Valid email required"),
  website: z.string().url("Valid URL required").optional().or(z.literal("")),
  maxCapacity: z.number().min(1, "Capacity must be at least 1").max(50, "Capacity cannot exceed 50"),
  currentOccupancy: z.number().min(0, "Occupancy cannot be negative").optional(),
  acceptsKittens: z.boolean(),
  acceptsCats: z.boolean(),
  services: z.array(z.string()).min(1, "At least one service must be selected"),
  facilities: z.array(z.string()).min(1, "At least one facility must be selected"),
  basePricePerDay: z.number().min(100, "Price must be at least ৳100"),
  kittenPricePerDay: z.number().min(100, "Price must be at least ৳100").optional(),
  weekendPremium: z.number().min(0, "Premium cannot be negative").optional(),
  holidayPremium: z.number().min(0, "Premium cannot be negative").optional(),
  availability: z.string().optional(),
  bookingRules: z.string().optional(),
});

type FormData = z.infer<typeof registrationSchema>;

interface FosterRegistrationFormProps {
  onSuccess?: () => void;
}

export function FosterRegistrationForm({ onSuccess }: FosterRegistrationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptsCats: true,
      acceptsKittens: false,
      services: [],
      facilities: [],
      maxCapacity: 5,
      currentOccupancy: 0,
      basePricePerDay: 300,
      weekendPremium: 0,
      holidayPremium: 0,
    },
  });

  const totalSteps = 5;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedServices((prev) => {
      const alreadySelected = prev.includes(serviceId);
      if (checked === alreadySelected) {
        return prev;
      }

      const next = checked ? [...prev, serviceId] : prev.filter((s) => s !== serviceId);
      setValue("services", next);
      return next;
    });
  };

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    setSelectedFacilities((prev) => {
      const alreadySelected = prev.includes(facilityId);
      if (checked === alreadySelected) {
        return prev;
      }

      const next = checked ? [...prev, facilityId] : prev.filter((f) => f !== facilityId);
      setValue("facilities", next);
      return next;
    });
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && galleryImages.length < 10) {
      Array.from(files).forEach((file) => {
        if (galleryImages.length < 10) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setGalleryImages((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createFosterProfile({
        ...data,
        coverImage,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      });

      if (result.success) {
        toast.success("সফলভাবে নিবন্ধিত! আপনার আবেদন পর্যালোচনার জন্য জমা দেওয়া হয়েছে।", {
          description: "Successfully registered! Your application is under review.",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/foster/register");
        }
      } else {
        toast.error("Registration failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: "An error occurred while registering",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">ব্যবসার তথ্য / Business Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">ব্যবসার নাম * / Business Name *</Label>
                  <Input
                    id="businessName"
                    {...register("businessName")}
                    placeholder="আপনার ফস্টার হোমের নাম / Your foster home name"
                    autoComplete="off"
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="businessNameEn">Business Name (English)</Label>
                  <Input
                    id="businessNameEn"
                    {...register("businessNameEn")}
                    placeholder="Business name in English"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="description">বিবরণ * / Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="আপনার ফস্টার হোম সম্পর্কে বিস্তারিত লিখুন / Describe your foster home in detail"
                    rows={4}
                    autoComplete="off"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Textarea
                    id="descriptionEn"
                    {...register("descriptionEn")}
                    placeholder="Description in English"
                    rows={4}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">ঠিকানা ও যোগাযোগ / Address & Contact</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="division">বিভাগ * / Division *</Label>
                  <Select {...register("division")} onValueChange={(value) => setValue("division", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন / Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANGLADESH_DIVISIONS.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.division && <p className="text-sm text-red-500 mt-1">{errors.division.message}</p>}
                </div>
                <div>
                  <Label htmlFor="area">এলাকা * / Area *</Label>
                  <Input
                    id="area"
                    {...register("area")}
                    placeholder="আপনার এলাকা / Your area"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
                  />
                  {errors.area && <p className="text-sm text-red-500 mt-1">{errors.area.message}</p>}
                </div>
                <div>
                  <Label htmlFor="address">বিস্তারিত ঠিকানা * / Address *</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="সম্পূর্ণ ঠিকানা / Full address"
                    rows={3}
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">ফোন নম্বর * / Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="01XXXXXXXXX"
                    autoComplete="off"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="altPhone">বিকল্প ফোন / Alternative Phone</Label>
                  <Input
                    id="altPhone"
                    {...register("altPhone")}
                    placeholder="01XXXXXXXXX (optional)"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="email">ইমেইল * / Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="your@email.com"
                    autoComplete="off"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">ওয়েবসাইট (ঐচ্ছিক) / Website (optional)</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://yourwebsite.com"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">সেবা ও সুযোগসুবিধা / Services & Facilities</h3>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  অন্তত একটি সেবা এবং একটি সুযোগসুবিধা নির্বাচন করুন / Select at least one service and one facility
                </AlertDescription>
              </Alert>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">সেবা / Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                      <div
                        key={service.id}
                        className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedServices.includes(service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => handleServiceToggle(service.id, checked === true)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label htmlFor={service.id} className="cursor-pointer font-medium">
                            {service.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.services && (
                    <p className="text-sm text-red-500 mt-2">{errors.services.message}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">সুযোগসুবিধা / Facilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FACILITIES.map((facility) => (
                      <div
                        key={facility.id}
                        className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedFacilities.includes(facility.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          id={facility.id}
                          checked={selectedFacilities.includes(facility.id)}
                          onCheckedChange={(checked) => handleFacilityToggle(facility.id, checked === true)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label htmlFor={facility.id} className="cursor-pointer font-medium">
                            {facility.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.facilities && (
                    <p className="text-sm text-red-500 mt-2">{errors.facilities.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">মূল্য নির্ধারণ / Pricing</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxCapacity">সর্বোচ্চ ধারণক্ষমতা * / Maximum Capacity *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    {...register("maxCapacity", { valueAsNumber: true })}
                    min={1}
                    max={50}
                    autoComplete="off"
                  />
                  {errors.maxCapacity && (
                    <p className="text-sm text-red-500 mt-1">{errors.maxCapacity.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentOccupancy">বর্তমান দখল / Current Occupancy</Label>
                  <Input
                    id="currentOccupancy"
                    type="number"
                    {...register("currentOccupancy", { valueAsNumber: true })}
                    min={0}
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="acceptsCats"
                    checked={watch("acceptsCats")}
                    onCheckedChange={(checked) => setValue("acceptsCats", checked as boolean)}
                  />
                  <Label htmlFor="acceptsCats" className="cursor-pointer">
                    বিড়াল গ্রহণ করি / Accept Cats
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="acceptsKittens"
                    checked={watch("acceptsKittens")}
                    onCheckedChange={(checked) => setValue("acceptsKittens", checked as boolean)}
                  />
                  <Label htmlFor="acceptsKittens" className="cursor-pointer">
                    বিড়ালছানা গ্রহণ করি / Accept Kittens
                  </Label>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="basePricePerDay">প্রতি দিনের মূল্য (বিড়াল) * / Daily Price (Cat) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <Input
                      id="basePricePerDay"
                      type="number"
                      {...register("basePricePerDay", { valueAsNumber: true })}
                      className="pl-8"
                      min={100}
                      autoComplete="off"
                    />
                  </div>
                  {errors.basePricePerDay && (
                    <p className="text-sm text-red-500 mt-1">{errors.basePricePerDay.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="kittenPricePerDay">প্রতি দিনের মূল্য (বিড়ালছানা) / Daily Price (Kitten)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <Input
                      id="kittenPricePerDay"
                      type="number"
                      {...register("kittenPricePerDay", { valueAsNumber: true })}
                      className="pl-8"
                      min={100}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="weekendPremium">উইকএন্ড প্রিমিয়াম / Weekend Premium</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <Input
                      id="weekendPremium"
                      type="number"
                      {...register("weekendPremium", { valueAsNumber: true })}
                      className="pl-8"
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="holidayPremium">ছুটির দিনের প্রিমিয়াম / Holiday Premium</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <Input
                      id="holidayPremium"
                      type="number"
                      {...register("holidayPremium", { valueAsNumber: true })}
                      className="pl-8"
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">ছবি ও অন্যান্য / Photos & More</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="coverImage">কভার ছবি * / Cover Image *</Label>
                  <div className="mt-2">
                    {coverImage ? (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setCoverImage("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          কভার ছবি আপলোড করুন / Upload cover image
                        </p>
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>গ্যালারি ছবি / Gallery Images</Label>
                  <div className="mt-2">
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {galleryImages.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                            <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {galleryImages.length < 10 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          গ্যালারি ছবি যোগ করুন ({galleryImages.length}/10) / Add gallery images
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="availability">প্রাপ্যতা / Availability</Label>
                  <Textarea
                    id="availability"
                    {...register("availability")}
                    placeholder="আপনার প্রাপ্যতার সময়সূচী লিখুন / Write your availability schedule"
                    rows={3}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="bookingRules">বুকিং নিয়ম / Booking Rules</Label>
                  <Textarea
                    id="bookingRules"
                    {...register("bookingRules")}
                    placeholder="চেক-ইন/আউট সময়, বাতিলকরণ নীতি ইত্যাদি / Check-in/out times, cancellation policy, etc."
                    rows={3}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>ফস্টার হোম নিবন্ধন / Foster Home Registration</CardTitle>
          <CardDescription>
            আপনার ফস্টার হোম নিবন্ধন করতে নিচের ফর্মটি পূরণ করুন / Fill the form below to register your foster home
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">{renderStep()}</div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            আগে / Previous
          </Button>
          {currentStep === totalSteps ? (
            <Button type="submit" disabled={isSubmitting || !coverImage}>
              {isSubmitting ? (
                "জমা দিচ্ছি... / Submitting..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  জমা দিন / Submit
                </>
              )}
            </Button>
          ) : (
            <Button type="button" onClick={nextStep}>
              পরবর্তী / Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
