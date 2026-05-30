import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Inisialisasi Rate Limiter untuk mencegah spam
const redis = Redis.fromEnv();
const ratelimitUpdate = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "20 s"), // 10 permintaan per 20 detik
  prefix: "ratelimit_halaqah_update",
});
const ratelimitDelete = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "20 s"), // 5 permintaan per 20 detik
  prefix: "ratelimit_halaqah_delete",
});

// Skema validasi Zod untuk data Halaqah yang masuk (parsial untuk update)
const HalaqahUpdateSchema = z.object({
  namaHalaqah: z.string().min(3, { message: "Nama halaqah minimal 3 karakter." }).optional(),
  guruId: z.number().int().positive({ message: "ID Guru tidak valid." }).optional(),
  santriIds: z.array(z.number().int().positive()).min(1, { message: "Pilih minimal satu santri." }).optional(),
  tahunAkademik: z.string().regex(/^\d{4}\/\d{4}$/, { message: "Format tahun akademik tidak valid." }).optional(),
  semester: z.enum(["S1", "S2"], { message: "Semester tidak valid." }).optional(),
}).partial(); // Semua field menjadi opsional

// UPDATE halaqah - Fungsi ini telah diamankan
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const halaqahId = parseInt(params.id, 10);

  try {
    // 1. Validasi ID dari URL
    if (isNaN(halaqahId)) {
      return NextResponse.json({ error: "ID Halaqah tidak valid" }, { status: 400 });
    }

    // 2. Terapkan Rate Limiting
    const { success } = await ratelimitUpdate.limit(`${ip}_${halaqahId}`);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan edit." }, { status: 429 });
    }

    const body = await req.json();

    // 3. Validasi data body menggunakan Zod
    const validation = HalaqahUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { namaHalaqah, guruId, santriIds, tahunAkademik, semester } = validation.data;

    // 4. Lakukan operasi database dalam satu transaksi
    const updatedHalaqah = await prisma.$transaction(async (tx) => {
      const halaqah = await tx.halaqah.update({
        where: { id: halaqahId },
        data: {
          namaHalaqah,
          guruId
        }
      });

      if (santriIds) {
        // Hapus relasi santri lama dan buat yang baru
        await tx.halaqahSantri.deleteMany({ where: { halaqahId } });
        if (santriIds.length > 0) {
          const halaqahSantriData = santriIds.map((santriId: number) => ({
            halaqahId: halaqahId,
            santriId: santriId,
            tahunAkademik: tahunAkademik || new Date().getFullYear() + "/" + (new Date().getFullYear() + 1), // Fallback jika tidak ada
            semester: semester || "S1", // Fallback jika tidak ada
          }));
          await tx.halaqahSantri.createMany({ data: halaqahSantriData });
        }
      }
      return halaqah;
    });

    return NextResponse.json(updatedHalaqah);

  } catch (error: unknown) {
    console.error('PUT /api/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui halaqah', detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE halaqah - Fungsi ini telah diamankan
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const halaqahId = parseInt(params.id, 10);

  try {
    // 1. Validasi ID dari URL
    if (isNaN(halaqahId)) {
      return NextResponse.json({ error: "ID Halaqah tidak valid" }, { status: 400 });
    }

    // 2. Terapkan Rate Limiting
    const { success } = await ratelimitDelete.limit(`${ip}_${halaqahId}`);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan hapus." }, { status: 429 });
    }

    // 3. Hapus dalam satu transaksi untuk menjaga konsistensi data
    await prisma.$transaction(async (tx) => {
      await tx.halaqahSantri.deleteMany({ where: { halaqahId } });
      await tx.halaqah.delete({ where: { id: halaqahId } });
    });

    return NextResponse.json({ message: "Halaqah berhasil dihapus" }, { status: 200 });

  } catch (error: unknown) {
    console.error('DELETE /api/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus halaqah', detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
