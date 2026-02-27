import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/oneoffs/:id — 更新单日任务（时间/时长）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const row = await prisma.oneOff.update({
    where: { id: params.id },
    data: {
      hour: body.hour,
      duration: body.duration,
    },
  });
  return NextResponse.json({
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    hour: row.hour,
    duration: row.duration,
  });
}

// DELETE /api/oneoffs/:id — 删除单日任务（同时清除完成记录）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 先删除相关的完成记录
  await prisma.completion.deleteMany({
    where: { sourceType: "oneoff", sourceId: params.id },
  });
  // 再删除任务本身
  await prisma.oneOff.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
