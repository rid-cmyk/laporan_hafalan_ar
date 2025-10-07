/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    const safeUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// CREATE user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Creating user with body:", body);

    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { error: "Missing required fields: username, password, roleId" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        namaLengkap: body.namaLengkap || "",
        noTlp: body.noTlp || null,
        roleId: Number(body.roleId),
      },
      include: { role: true },
    });

    // filter password
    const { password, ...safeUser } = user;
    console.log("User created:", safeUser);
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({
      error: "Failed to create user",
      details: error.message
    }, { status: 500 });
  }
}
