"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import type { Role } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === ("ADMIN" as Role),
    signIn,
    signOut,
  };
}
