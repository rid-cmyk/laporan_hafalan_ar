import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: 'tahun_ajaran_' } },
    });
    const data: Record<string, string> = {};
    settings.forEach(s => { data[s.key.replace('tahun_ajaran_', '')] = s.value; });
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/settings/tahun-ajaran error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upserts = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key: `tahun_ajaran_${key}` },
        update: { value: String(value) },
        create: { key: `tahun_ajaran_${key}`, value: String(value) },
      })
    );
    await Promise.all(upserts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/settings/tahun-ajaran error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
