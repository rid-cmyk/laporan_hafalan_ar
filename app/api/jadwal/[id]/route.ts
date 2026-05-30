import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hari, jamMulai, jamSelesai, halaqahId } = body;

    const jadwal = await prisma.jadwal.update({
      where: { id: Number(id) },
      data: {
        hari,
        jamMulai: new Date(`1970-01-01T${jamMulai}:00Z`),
        jamSelesai: new Date(`1970-01-01T${jamSelesai}:00Z`),
        halaqahId: halaqahId ? Number(halaqahId) : undefined,
      },
    });

    return NextResponse.json(jadwal);
  } catch (error: unknown) {
    console.error('PUT /api/jadwal/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update jadwal',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.jadwal.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error: unknown) {
    console.error('DELETE /api/jadwal/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete jadwal',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
