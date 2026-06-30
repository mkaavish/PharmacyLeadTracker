import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const pharmacy = await (prisma as any).pharmacy.findUnique({
    where: { id: parseInt(id) },
    include: {
      tags: { include: { tag: true } },
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!pharmacy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pharmacy);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { tags, notes, tasks, activityLogs, _count, ...data } = body;

  // Auto-log status change
  if (data.status) {
    const existing = await (prisma as any).pharmacy.findUnique({ where: { id: parseInt(id) } });
    if (existing && existing.status !== data.status) {
      await (prisma as any).activityLog.create({
        data: {
          pharmacyId: parseInt(id),
          action: "Status Changed",
          detail: `${existing.status} → ${data.status}`,
        },
      });
      if (!existing.contacted && data.status !== "Not Contacted") {
        data.contacted = true;
        data.firstContactDate = data.firstContactDate || new Date().toISOString();
      }
      data.lastContactDate = new Date().toISOString();
    }
  }

  const pharmacy = await (prisma as any).pharmacy.update({
    where: { id: parseInt(id) },
    data,
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(pharmacy);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await (prisma as any).pharmacy.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
