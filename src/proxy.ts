import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/features", "/pricing"];
const publicApiPaths = ["/api/auth/login", "/api/auth/signup", "/api/verify"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Allow public API paths
  if (publicApiPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check auth token — cookie or Authorization Bearer header
  const token =
    req.cookies.get("auth-token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    // API routes get 401, not a redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await verifyToken(token);

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based redirects
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    if (user.role === "OPERATOR") return NextResponse.redirect(new URL("/operator", req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/operator") && user.role === "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
