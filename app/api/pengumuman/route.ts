import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all pengumuman (with pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [pengumuman, total] = await Promise.all([
      prisma.pengumuman.findMany({
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pengumuman.count(),
    ]);

    return NextResponse.json({
      data: pengumuman,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
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
  } catch (error: unknown) {
    console.error('POST /api/pengumuman error:', error);
    return NextResponse.json({
      error: 'Failed to create pengumuman',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}