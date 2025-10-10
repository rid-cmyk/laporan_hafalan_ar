/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // 1. Not logged in → redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const role = decoded.role?.toLowerCase();

    // Pass user info to downstream routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-name", decoded.namaLengkap);

    const url = req.nextUrl.clone();
    const path = url.pathname;

    // 3. Role-based access rules
    if (path.startsWith("/users") || path.startsWith("/settings")) {
      if (!["super_admin", "admin"].includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (path.startsWith("/guru") && role !== "guru") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/orang_tua") && role !== "orang_tua") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/siswa") && role !== "siswa") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ✅ 4. Allow access
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error("JWT error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ✅ 5. Match all protected routes
export const config = {
  matcher: [
    // Dashboard
    "/dashboard",
    "/dashboard/:path*",

    // Users (admin only)
    "/users",
    "/users/:path*",

    // Settings (admin only)
    "/settings",
    "/settings/:path*",

    // Guru
    "/guru",
    "/guru/:path*",

    // Orang Tua
    "/orang_tua",
    "/orang_tua/:path*",

    // Siswa
    "/siswa",
    "/siswa/:path*",
  ],
};

