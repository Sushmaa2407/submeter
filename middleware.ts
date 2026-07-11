// ============================================================
// Middleware — runs on the server BEFORE a page even renders,
// in Next.js's lightweight Edge runtime.
//
// IMPORTANT: this imports NextAuth directly with the EDGE-SAFE
// config (lib/auth.config.ts), NOT the full lib/auth.ts. That
// full file includes argon2 (native Rust code) for password
// checking, which Edge cannot run. Middleware never checks a
// password anyway — it only reads the role already stored in
// the signed cookie from a previous, real login.
//
// UPDATED: now tells apart two different situations that used to
// look identical to the user:
//   - Not logged in at all              → send to /login
//   - Logged in, but wrong role for this page → send to /forbidden
// A customer hitting an admin page should see "you don't have
// access", not be quietly treated as logged-out.
// ============================================================
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  if (isCustomerRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

// Only run this middleware on the routes that actually need
// protecting — running it on every static asset request would be
// wasted work.
export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};