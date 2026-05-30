import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import { z } from "zod";

// Konfigurasi Rate Limiting menggunakan Upstash Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 permintaan per 10 detik
  analytics: true,
  prefix: "@upstash/ratelimit",
});

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "mysecretkey");

const LoginSchema = z.object({
  passCode: z.string().min(1, { message: "Passcode wajib diisi" }),
});

export async function POST(req: Request) {
  // Ambil IP address dari header atau fallback ke "127.0.0.1"
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  try {
    // Terapkan rate limiting berdasarkan IP
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Permintaan tidak valid", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { passCode } = validation.data;

    const user = await prisma.user.findFirst({
      where: { passCode },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Passcode tidak valid" }, { status: 401 });
    }

    const token = await new SignJWT({
      id: user.id,
      namaLengkap: user.namaLengkap,
      role: user.role.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secret);

    const res = NextResponse.json({
      message: "Login berhasil",
      user: { namaLengkap: user.namaLengkap, role: user.role.name },
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10, // 10 menit
    });

    return res;
  } catch (err) {
    console.error("Error di API Login:", err);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
