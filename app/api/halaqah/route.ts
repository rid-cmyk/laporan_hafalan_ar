import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Inisialisasi Rate Limiter untuk mencegah spam
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "20 s"), // 5 permintaan per 20 detik
  analytics: true,
  prefix: "ratelimit_halaqah_create",
});

// Skema validasi Zod untuk data Halaqah yang masuk
const HalaqahSchema = z.object({
  namaHalaqah: z.string().min(3, { message: "Nama halaqah minimal 3 karakter." }),
  guruId: z.number().int().positive({ message: "ID Guru tidak valid." }),
  santriIds: z.array(z.number().int().positive()).min(1, { message: "Pilih minimal satu santri." }),
  tahunAkademik: z.string().regex(/^\d{4}\/\d{4}$/, { message: "Format tahun akademik tidak valid (contoh: 2025/2026)." }),
  semester: z.enum(["S1", "S2"], { message: "Semester tidak valid." }),
});

// GET all halaqah (with pagination) - Fungsi ini tidak diubah
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [halaqah, total] = await Promise.all([
      prisma.halaqah.findMany({
        include: {
          guru: { select: { id: true, namaLengkap: true, username: true } },
          santri: {
            include: {
              santri: { select: { id: true, namaLengkap: true, username: true } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.halaqah.count(),
    ]);

    const formatted = halaqah.map(h => ({
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      guru: h.guru,
      santri: h.santri.map(s => s.santri),
      jumlahSantri: h.santri.length
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
    console.error('GET /api/halaqah error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data halaqah' }, { status: 500 });
  }
}

// CREATE halaqah - Fungsi ini telah diamankan
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  try {
    // 1. Terapkan Rate Limiting
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
    }

    const body = await request.json();

    // 2. Validasi data menggunakan Zod
    const validation = HalaqahSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { namaHalaqah, guruId, santriIds, tahunAkademik, semester } = validation.data;

    // 3. Simpan data yang sudah divalidasi ke database
    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah,
        guruId: guruId
      }
    });

    const halaqahSantriData = santriIds.map((santriId: number) => ({
      halaqahId: halaqah.id,
      santriId: santriId,
      tahunAkademik,
      semester
    }));

    await prisma.halaqahSantri.createMany({
      data: halaqahSantriData
    });

    return NextResponse.json(halaqah, { status: 201 });

  } catch (error: unknown) {
    console.error('POST /api/halaqah error:', error);
    // Tangani error jika ada duplikasi atau masalah database lain
    if (error instanceof z.ZodError) {
       return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Gagal membuat halaqah',
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
