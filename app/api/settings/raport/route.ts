import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: 'raport_' } },
    });
    const data: Record<string, string> = {};
    settings.forEach(s => { data[s.key.replace('raport_', '')] = s.value; });
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/settings/raport error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upserts = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key: `raport_${key}` },
        update: { value: String(value) },
        create: { key: `raport_${key}`, value: String(value) },
      })
    );
    await Promise.all(upserts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/settings/raport error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
