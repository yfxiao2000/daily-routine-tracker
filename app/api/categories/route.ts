import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories — 获取自定义分类
// 只返回 isDefault=false 的分类（默认分类在前端已有）
// 返回格式：Record<string, CategoryConfig>
export async function GET() {
  const rows = await prisma.category.findMany({
    where: { isDefault: false },
  });
  const categories: Record<string, { label: string; color: string; bg: string }> = {};
  for (const row of rows) {
    categories[row.key] = {
      label: row.label,
      color: row.color,
      bg: row.bg,
    };
  }
  return NextResponse.json(categories);
}

// POST /api/categories — 创建自定义分类
// Body: { key, label, color, bg }
export async function POST(request: NextRequest) {
  const body = await request.json();
  await prisma.category.create({
    data: {
      key: body.key,
      label: body.label,
      color: body.color,
      bg: body.bg,
      isDefault: false,
    },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
