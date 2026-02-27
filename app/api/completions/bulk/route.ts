import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/completions/bulk — 批量导入完成记录（用于数据导入功能）
// Body: Record<string, boolean>（和前端 CompletionRecord 格式一致）
export async function PUT(request: NextRequest) {
  const record: Record<string, boolean> = await request.json();

  // 清空现有记录
  await prisma.completion.deleteMany();

  // 只导入值为 true 的记录
  const entries = Object.entries(record).filter(([, v]) => v);
  for (const [key] of entries) {
    const [date, sourceType, sourceId] = key.split(":");
    await prisma.completion.create({
      data: { date, sourceType, sourceId, completed: true },
    });
  }

  return NextResponse.json({ imported: entries.length });
}
