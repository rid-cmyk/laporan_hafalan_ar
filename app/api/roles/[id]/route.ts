/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";


// UPDATE role
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id: Number(params.id) },
      data: { name: body.name },
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error("PUT /api/roles/[id] error:", error.message, error);
    return NextResponse.json(
      { error: "Failed to update role", detail: error.message },
      { status: 500 }
    );
  }
}

// DELETE role
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.role.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Role deleted" });
  } catch (error) {
    console.error("DELETE /api/roles/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
