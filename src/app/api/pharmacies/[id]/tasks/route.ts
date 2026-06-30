import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const tasks = await (prisma as any).task.findMany({
    where: { pharmacyId: parseInt(id) },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const task = await (prisma as any).task.create({
    data: { ...body, pharmacyId: parseInt(id) },
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { taskId, ...data } = await req.json();
  const task = await (prisma as any).task.update({
    where: { id: taskId, pharmacyId: parseInt(id) },
    data,
  });
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { taskId } = await req.json();
  await (prisma as any).task.delete({ where: { id: taskId, pharmacyId: parseInt(id) } });
  return NextResponse.json({ success: true });
}
