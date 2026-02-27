import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/completions — 获取所有完成记录
// 返回格式：Record<string, boolean>（和前端 CompletionRecord 一致）
export async function GET() {
  const rows = await prisma.completion.findMany();
  const record: Record<string, boolean> = {};
  for (const row of rows) {
    // 拼接成前端使用的 key 格式："date:sourceType:sourceId"
    record[`${row.date}:${row.sourceType}:${row.sourceId}`] = row.completed;
  }
  return NextResponse.json(record);
}

// PUT /api/completions — 切换单条完成记录
// Body: { date, sourceType, sourceId }
export async function PUT(request: NextRequest) {
  const { date, sourceType, sourceId } = await request.json();

  // 查找是否已存在
  const existing = await prisma.completion.findUnique({
    where: { date_sourceType_sourceId: { date, sourceType, sourceId } },
  });

  if (existing) {
    if (existing.completed) {
      // 已完成 → 取消完成（删除记录）
      await prisma.completion.delete({ where: { id: existing.id } });
      return NextResponse.json({ completed: false });
    } else {
      // 标记为完成
      await prisma.completion.update({
        where: { id: existing.id },
        data: { completed: true },
      });
      return NextResponse.json({ completed: true });
    }
  } else {
    // 新建完成记录
    await prisma.completion.create({
      data: { date, sourceType, sourceId, completed: true },
    });
    return NextResponse.json({ completed: true });
  }
}
