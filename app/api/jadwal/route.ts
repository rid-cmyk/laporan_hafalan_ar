import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all jadwal (with pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [jadwal, total] = await Promise.all([
      prisma.jadwal.findMany({
        include: {
          halaqah: {
            include: {
              guru: { select: { id: true, namaLengkap: true, username: true } }
            }
          }
        },
        orderBy: { jamMulai: 'asc' },
        skip,
        take: limit,
      }),
      prisma.jadwal.count(),
    ]);

    return NextResponse.json({
      data: jadwal,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('GET /api/jadwal error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}

// CREATE jadwal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hari, jamMulai, jamSelesai, halaqahId } = body;

    if (!hari || !jamMulai || !jamSelesai || !halaqahId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for conflicts
    const conflict = await prisma.jadwal.findFirst({
      where: {
        hari,
        halaqahId: Number(halaqahId),
        OR: [
          {
            AND: [
              { jamMulai: { lte: jamMulai } },
              { jamSelesai: { gt: jamMulai } }
            ]
          },
          {
            AND: [
              { jamMulai: { lt: jamSelesai } },
              { jamSelesai: { gte: jamSelesai } }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({ error: 'Jadwal bentrok dengan jadwal lain' }, { status: 400 });
    }

    const jadwal = await prisma.jadwal.create({
      data: {
        hari,
        jamMulai: new Date(`1970-01-01T${jamMulai}:00Z`),
        jamSelesai: new Date(`1970-01-01T${jamSelesai}:00Z`),
        halaqahId: Number(halaqahId)
      }
    });

    return NextResponse.json(jadwal);
  } catch (error: unknown) {
    console.error('POST /api/jadwal error:', error);
    return NextResponse.json({
      error: 'Failed to create jadwal',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}