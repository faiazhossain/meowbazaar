import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Protected routes
  const isAccountRoute = nextUrl.pathname.startsWith("/account");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/account", nextUrl));
  }

  // Protect account routes
  if (isAccountRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  // Protect checkout route
  if (isCheckoutRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/auth/:path*",
  ],
};
