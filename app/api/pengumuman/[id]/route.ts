import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UPDATE pengumuman
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Pengumuman ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { judul, isi } = body;

    if (!judul || !isi) {
      return NextResponse.json({ error: 'Judul dan isi diperlukan' }, { status: 400 });
    }

    const pengumuman = await prisma.pengumuman.update({
      where: { id: Number(id) },
      data: { judul, isi }
    });

    return NextResponse.json(pengumuman);
  } catch (error: unknown) {
    console.error('PUT /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update pengumuman', detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE pengumuman
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Pengumuman ID is required' }, { status: 400 });
    }

    await prisma.pengumuman.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Pengumuman deleted' });
  } catch (error: unknown) {
    console.error('DELETE /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete pengumuman', detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}