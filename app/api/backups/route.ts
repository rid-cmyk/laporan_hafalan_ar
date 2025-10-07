import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { tanggalBackup: 'desc' },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error("GET /api/backups error:", error);
    return NextResponse.json({ error: "Failed to fetch backups" }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Simple backup: just create a record (actual backup implementation would require database-specific tools)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;

    // Save to DB
    const backup = await prisma.backup.create({
      data: {
        namaFile: fileName,
      },
    });

    return NextResponse.json(backup);
  } catch (error) {
    console.error("POST /api/backups error:", error);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}