import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UPDATE role
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const role = await prisma.role.update({
    where: { id: Number(params.id) },
    data: { name: body.name },
  });
  return NextResponse.json(role);
}

// DELETE role
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.role.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Deleted" });
}
