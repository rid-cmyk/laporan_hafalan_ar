import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


// GET all users (with pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: { role: true },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.user.count(),
    ]);

    const safeUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json({
      data: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
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
  } catch (error: unknown) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
