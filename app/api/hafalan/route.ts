import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const santriIdParam = searchParams.get('santriId');
    const statusParam = searchParams.get('status');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');
    const sortBy = searchParams.get('sortBy') || 'tanggal';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' as const : 'desc' as const;

    const where: Prisma.HafalanWhereInput = {};

    if (santriIdParam) {
      where.santriId = parseInt(santriIdParam);
    }

    if (statusParam === 'ziyadah' || statusParam === 'murojaah') {
      where.status = statusParam;
    }

    if (tanggalMulai || tanggalSelesai) {
      const tanggalFilter: Prisma.DateTimeFilter = {};
      if (tanggalMulai) tanggalFilter.gte = new Date(tanggalMulai);
      if (tanggalSelesai) tanggalFilter.lte = new Date(tanggalSelesai);
      where.tanggal = tanggalFilter;
    }

    const orderBy: Prisma.HafalanOrderByWithRelationInput = {};
    if (sortBy === 'tanggal' || sortBy === 'surat' || sortBy === 'status') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.tanggal = 'desc';
    }

    const [hafalan, total] = await Promise.all([
      prisma.hafalan.findMany({
        where,
        include: {
          santri: {
            select: { id: true, namaLengkap: true, username: true }
          }
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.hafalan.count({ where }),
    ]);

    const formatted = hafalan.map(h => ({
      id: h.id,
      tanggal: h.tanggal,
      surat: h.surat,
      ayatMulai: h.ayatMulai,
      ayatSelesai: h.ayatSelesai,
      status: h.status,
      keterangan: h.keterangan,
      santri: h.santri,
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('GET /api/hafalan error:', error);
    return NextResponse.json({ error: 'Failed to fetch hafalan' }, { status: 500 });
  }
}
