import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function POST(req: Request) {
  try {
    const { passCode } = await req.json();

    if (!passCode) {
      return NextResponse.json({ error: "Passcode required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { passCode },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        namaLengkap: user.namaLengkap,
        role: user.role.name,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Set cookie
    const res = NextResponse.json({
      message: "Login success",
      user: { namaLengkap: user.namaLengkap, role: user.role.name },
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
