import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET || "mysecretkey";
const JWT_SECRET = new TextEncoder().encode(secret);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token || typeof token !== "string") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload.role as string)?.toLowerCase();


    const requestHeaders = new Headers(req.headers);
    if (payload.role) requestHeaders.set("x-user-role", payload.role as string);
    if (payload.namaLengkap)
      requestHeaders.set("x-user-name", payload.namaLengkap as string);

    const url = req.nextUrl.clone();
    const path = url.pathname;

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

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/users",
    "/users/:path*",
    "/settings",
    "/settings/:path*",
    "/guru",
    "/guru/:path*",
    "/orang_tua",
    "/orang_tua/:path*",
    "/siswa",
    "/siswa/:path*",
  ],
};
