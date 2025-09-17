/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UPDATE role
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: { name: body.name },
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('PUT /api/roles/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update role', detail: error.message }, { status: 500 });
  }
}

// DELETE role
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.role.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Role deleted' });
  } catch (error: any) {
    console.error('DELETE /api/roles/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
