"use client";

import { logout } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ className, showText = true }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      <LogOut className={`h-5 w-5 ${isPending ? "animate-pulse" : ""}`} />
      {showText && (
        <span className="font-medium">
          {isPending ? "লগআউট হচ্ছে..." : "লগআউট"}
        </span>
      )}
    </button>
  );
}
