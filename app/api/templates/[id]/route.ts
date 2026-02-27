import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/templates/:id — 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const row = await prisma.template.update({
    where: { id: params.id },
    data: {
      title: body.title,
      category: body.category,
      repeatDays: JSON.stringify(body.repeatDays),
      hour: body.hour,
      duration: body.duration,
    },
  });
  return NextResponse.json({
    id: row.id,
    title: row.title,
    category: row.category,
    repeatDays: JSON.parse(row.repeatDays),
    hour: row.hour,
    duration: row.duration,
  });
}

// DELETE /api/templates/:id — 删除模板
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
