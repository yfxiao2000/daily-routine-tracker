import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/templates — 获取所有模板
export async function GET() {
  const rows = await prisma.template.findMany({
    orderBy: { createdAt: "asc" },
  });
  // repeatDays 在数据库中是 JSON 字符串，需要解析回数组
  const templates = rows.map((r: { id: string; title: string; category: string; repeatDays: string; hour: number; duration: number }) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    repeatDays: JSON.parse(r.repeatDays),
    hour: r.hour,
    duration: r.duration,
  }));
  return NextResponse.json(templates);
}

// POST /api/templates — 创建新模板
export async function POST(request: NextRequest) {
  const body = await request.json();
  const row = await prisma.template.create({
    data: {
      title: body.title,
      category: body.category,
      repeatDays: JSON.stringify(body.repeatDays),
      hour: body.hour ?? 9,
      duration: body.duration ?? 1,
    },
  });
  return NextResponse.json(
    {
      id: row.id,
      title: row.title,
      category: row.category,
      repeatDays: JSON.parse(row.repeatDays),
      hour: row.hour,
      duration: row.duration,
    },
    { status: 201 }
  );
}
