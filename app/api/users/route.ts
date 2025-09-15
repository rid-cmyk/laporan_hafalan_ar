/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    // jangan return password
    const safeUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// CREATE user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        namaLengkap: body.namaLengkap,
        noTlp: body.noTlp,
        roleId: body.roleId,
      },
      include: { role: true },
    });

    // filter password
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
