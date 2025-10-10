/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-name", decoded.namaLengkap);

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

// ✅ Protect only dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
