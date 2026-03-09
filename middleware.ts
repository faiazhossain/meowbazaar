import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";

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
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/auth/:path*",
  ],
};
