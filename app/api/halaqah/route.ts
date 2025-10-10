import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all halaqah
export async function GET() {
  try {
    const halaqah = await prisma.halaqah.findMany({
      include: {
        guru: true,
        santri: {
          include: {
            santri: true
          }
        }
      }
    });

    const formatted = halaqah.map(h => ({
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      guru: h.guru,
      santri: h.santri.map(s => s.santri),
      jumlahSantri: h.santri.length
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/halaqah error:', error);
    return NextResponse.json({ error: 'Failed to fetch halaqah' }, { status: 500 });
  }
}

// CREATE halaqah
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { namaHalaqah, guruId, santriIds, tahunAkademik, semester } = body;

    if (!namaHalaqah || !guruId || !santriIds || !tahunAkademik || !semester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create halaqah
    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah,
        guruId: Number(guruId)
      }
    });

    // Create halaqahSantri for each santri
    const halaqahSantriData = santriIds.map((santriId: number) => ({
      halaqahId: halaqah.id,
      santriId: Number(santriId),
      tahunAkademik,
      semester: semester as 'S1' | 'S2'
    }));

    await prisma.halaqahSantri.createMany({
      data: halaqahSantriData
    });

    return NextResponse.json(halaqah);
  } catch (error: any) {
    console.error('POST /api/halaqah error:', error);
    return NextResponse.json({
      error: 'Failed to create halaqah',
      details: error.message
    }, { status: 500 });
  }
}