import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UPDATE halaqah
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Halaqah ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { namaHalaqah, guruId, santriIds, tahunAkademik, semester } = body;

    // Update halaqah
    const halaqah = await prisma.halaqah.update({
      where: { id: Number(id) },
      data: {
        namaHalaqah,
        guruId: Number(guruId)
      }
    });

    // Delete existing halaqahSantri
    await prisma.halaqahSantri.deleteMany({
      where: { halaqahId: Number(id) }
    });

    // Create new halaqahSantri
    if (santriIds && santriIds.length > 0) {
      const halaqahSantriData = santriIds.map((santriId: number) => ({
        halaqahId: Number(id),
        santriId: Number(santriId),
        tahunAkademik,
        semester: semester as 'S1' | 'S2'
      }));

      await prisma.halaqahSantri.createMany({
        data: halaqahSantriData
      });
    }

    return NextResponse.json(halaqah);
  } catch (error: any) {
    console.error('PUT /api/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update halaqah', detail: error.message }, { status: 500 });
  }
}

// DELETE halaqah
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Halaqah ID is required' }, { status: 400 });
    }

    // Delete halaqahSantri first
    await prisma.halaqahSantri.deleteMany({
      where: { halaqahId: Number(id) }
    });

    // Delete halaqah
    await prisma.halaqah.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Halaqah deleted' });
  } catch (error: any) {
    console.error('DELETE /api/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete halaqah', detail: error.message }, { status: 500 });
  }
}