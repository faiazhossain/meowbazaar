"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function NewBlogPostPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the create page
    router.replace("/admin/blog/create");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
