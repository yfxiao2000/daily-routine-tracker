import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/oneoffs — 获取所有单日任务
export async function GET() {
  const rows = await prisma.oneOff.findMany({
    orderBy: { createdAt: "asc" },
  });
  const tasks = rows.map((r: { id: string; title: string; category: string; date: string; hour: number; duration: number }) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    hour: r.hour,
    duration: r.duration,
  }));
  return NextResponse.json(tasks);
}

// POST /api/oneoffs — 创建单日任务
export async function POST(request: NextRequest) {
  const body = await request.json();
  const row = await prisma.oneOff.create({
    data: {
      title: body.title,
      category: body.category,
      date: body.date,
      hour: body.hour ?? 9,
      duration: body.duration ?? 1,
    },
  });
  return NextResponse.json(
    {
      id: row.id,
      title: row.title,
      category: row.category,
      date: row.date,
      hour: row.hour,
      duration: row.duration,
    },
    { status: 201 }
  );
}
