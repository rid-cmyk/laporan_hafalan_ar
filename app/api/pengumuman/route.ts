import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all pengumuman
export async function GET() {
  try {
    const pengumuman = await prisma.pengumuman.findMany({
      orderBy: { tanggal: 'desc' }
    });

    return NextResponse.json(pengumuman);
  } catch (error) {
    console.error('GET /api/pengumuman error:', error);
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 });
  }
}

// CREATE pengumuman
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, isi } = body;

    if (!judul || !isi) {
      return NextResponse.json({ error: 'Judul dan isi diperlukan' }, { status: 400 });
    }

    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        tanggal: new Date()
      }
    });

    return NextResponse.json(pengumuman);
  } catch (error: any) {
    console.error('POST /api/pengumuman error:', error);
    return NextResponse.json({
      error: 'Failed to create pengumuman',
      details: error.message
    }, { status: 500 });
  }
}