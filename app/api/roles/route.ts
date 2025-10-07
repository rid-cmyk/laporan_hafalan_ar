
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


// GET all roles
export async function GET() {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  // Transform the data to include userCount
  const rolesWithCount = roles.map(role => ({
    id: role.id,
    name: role.name,
    userCount: role._count.users
  }));

  return NextResponse.json(rolesWithCount);
}

// CREATE role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Creating role with body:", body);

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const trimmedName = body.name.trim();

    // Normalize role name: capitalize first letter, rest lowercase
    const normalizedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    // Check for case-insensitive duplicate using manual checks
    const upperCaseCheck = await prisma.role.findFirst({
      where: { name: normalizedName.toUpperCase() }
    });
    if (upperCaseCheck) {
      return NextResponse.json({
        error: `Role "${normalizedName}" sudah ada. Gunakan nama lain.`
      }, { status: 400 });
    }

    const lowerCaseCheck = await prisma.role.findFirst({
      where: { name: normalizedName.toLowerCase() }
    });
    if (lowerCaseCheck) {
      return NextResponse.json({
        error: `Role "${normalizedName}" sudah ada. Gunakan nama lain.`
      }, { status: 400 });
    }

    // Also check exact match
    const exactCheck = await prisma.role.findFirst({
      where: { name: normalizedName }
    });
    if (exactCheck) {
      return NextResponse.json({
        error: `Role "${normalizedName}" sudah ada. Gunakan nama lain.`
      }, { status: 400 });
    }


    const role = await prisma.role.create({
      data: { name: normalizedName },
    });

    console.log("Role created:", role);
    return NextResponse.json(role);
  } catch (error: any) {
    console.error("POST /api/roles error:", error);
    return NextResponse.json({
      error: "Failed to create role",
      details: error.message
    }, { status: 500 });
  }
}
