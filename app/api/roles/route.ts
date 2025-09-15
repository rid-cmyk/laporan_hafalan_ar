
import prisma from "@/lib/prisma"; 
import { NextResponse } from "next/server";
export const runtime = 'edge';


// GET all roles
export async function GET() {
  const roles = await prisma.role.findMany();
  return NextResponse.json(roles);
}

// CREATE role
export async function POST(req: Request) {
  const body = await req.json();
  const role = await prisma.role.create({
    data: { name: body.name },
  });
  return NextResponse.json(role);
}
