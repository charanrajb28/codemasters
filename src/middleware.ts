import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "__session";

/**
 * Lightweight JWT payload decode (no signature verification).
 * Verification happens server-side in Server Actions via Firebase Admin SDK.
 * Firebase session cookies are JWTs — we only decode the payload here for routing.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const roleCookie = request.cookies.get("__role")?.value;

  const isAuthenticated = !!sessionCookie;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Protected routes require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/problems") ||
    pathname.startsWith("/submissions") ||
    isAdminRoute;

  // Determine user role (prefer explicit __role cookie set from Firestore, fallback to decoded JWT)
  let role: string | undefined = roleCookie;
  if (!role && sessionCookie) {
    const payload = decodeJwtPayload(sessionCookie);
    const claimsRole = (payload?.claims as Record<string, unknown> | undefined)?.role;
    role = (payload?.role as string | undefined) || (claimsRole as string | undefined);
  }

  // Redirect logged-in users away from auth pages to /admin or /dashboard
  if (isAuthenticated && isAuthRoute) {
    const destination = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Redirect unauthenticated users trying to access protected routes to /login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route protection — redirect non-admins to /dashboard
  if (isAuthenticated && isAdminRoute) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)"],
};

