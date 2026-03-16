"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProfilePicture, removeProfilePicture } from "@/lib/actions/upload";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface AvatarUploadProps {
  currentImage?: string | null;
  userName?: string | null;
}

export function AvatarUpload({ currentImage, userName }: AvatarUploadProps) {
  const { update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 2MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProfilePicture(formData);

      if (result.success) {
        toast.success("Profile picture updated successfully");
        // Update session
        await update({ image: result.url });
      } else {
        toast.error(result.error || "Failed to upload image");
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error("Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const result = await removeProfilePicture();

      if (result.success) {
        toast.success("Profile picture removed");
        setPreviewUrl(null);
        await update({ image: null });
      } else {
        toast.error(result.error || "Failed to remove image");
      }
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      setIsUploading(false);
    }
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={userName || "Profile"}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>

        {/* Upload overlay button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          Change Photo
        </Button>

        {displayImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-destructive hover:bg-destructive/10"
          >
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG or WebP. Max 2MB.
      </p>
    </div>
  );
}
