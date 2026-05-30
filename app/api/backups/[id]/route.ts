import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.backup.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Backup berhasil dihapus' });
  } catch (error: unknown) {
    console.error('DELETE /api/backups/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete backup',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
