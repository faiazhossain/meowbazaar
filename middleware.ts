import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";
  const isFosterOwner = token?.role === "FOSTER_OWNER";

  // Protected routes
  const isAccountRoute = nextUrl.pathname.startsWith("/account");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isFosterRoute = nextUrl.pathname.startsWith("/foster/dashboard");
  const isFosterRegisterRoute = nextUrl.pathname.startsWith("/foster/register");
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

  // Protect foster dashboard routes
  if (isFosterRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }
    if (!isFosterOwner && !isAdmin) {
      return NextResponse.redirect(new URL("/foster/register", nextUrl));
    }
  }

  // Protect foster register route (redirect if already has foster profile)
  if (isFosterRegisterRoute && isLoggedIn && isFosterOwner) {
    // We'll let the page handle the redirect based on profile status
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/foster/dashboard/:path*",
    "/foster/register",
    "/checkout/:path*",
    "/auth/:path*",
  ],
};
